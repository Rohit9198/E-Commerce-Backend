import crypto from "crypto";
import ErrorHandler from "../middlewares/errorMiddleware.js"; 
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import { generatePaymentIntent } from "../utils/generatePaymentIntent.js";


export const placeNewOrder = catchAsyncError(async(req, res, next) =>{
   const {full_name, state, city, country, address, pincode, phone, orderedItems} = req.body;
   if(
    ! full_name||
    ! state ||
    ! city ||
    ! country||
    ! address||
    ! pincode||
    ! phone
   ){
     return next(new ErrorHandler("Please provide complete shipping details.", 400)
    );
   }

   const items = Array.isArray(orderedItems)
   ? orderedItems
   : JSON.parse(orderedItems);

   if(!items || items.length === 0){
    return next(new ErrorHandler("No items in cart.", 400));
   }

   const productIds = items.map((item) => item.product.id);
   const {rows: products} = await database.query(`SELECT id, price, stock, name FROM products WHERE id= ANY($1::uuid[])`,
    [productIds]
   );

   let itemsTotal = 0;
   const values = [];
   const placeholders = [];

   for (let index = 0; index < items.length; index++) {
     const item = items[index];
     const product = products.find((p) => p.id === item.product.id);

     if (!product) {
       return next(
         new ErrorHandler(`Product not found for ID: ${item.product.id}`, 404)
       );
     }

     if (item.quantity > product.stock) {
       return next(
         new ErrorHandler(
           `Only ${product.stock} units available for ${product.name}`,
           400
         )
       );
     }

     const itemTotal = Number(product.price) * item.quantity;
     itemsTotal += itemTotal;

     let itemImage = "";
     if (item.product?.images) {
       const imgs =
         typeof item.product.images === "string"
           ? JSON.parse(item.product.images)
           : item.product.images;
       if (Array.isArray(imgs) && imgs.length > 0) {
         itemImage = imgs[0]?.url || imgs[0] || "";
       }
     }

     values.push(
       null,
       product.id,
       item.quantity,
       product.price,
       itemImage,
       product.name
     );

     const offset = index * 6;

     placeholders.push(
       `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
     );
   }

   const taxRate = 0.18;
   const shipping_price = itemsTotal >= 50 ? 0 : 2;
   const tax_price = Math.round(itemsTotal * taxRate);
   const total_price = Math.round(itemsTotal + tax_price + shipping_price);

   const orderResult = await database.query(
     `INSERT INTO orders (buyer_id, total_price, tax_price, shipping_price) VALUES($1, $2, $3, $4) RETURNING *`,
     [req.user.id, total_price, tax_price, shipping_price]
   );

   const orderId = orderResult.rows[0].id;

   for (let i = 0; i < values.length; i += 6) {
     values[i] = orderId;
   }

   await database.query(
     `INSERT INTO order_items (order_id, product_id, quantity, price, image, title) 
      VALUES ${placeholders.join(" ,")} RETURNING *`,
     values
   );

   await database.query(
     `INSERT INTO shipping_info (order_id, full_name, state, city, country, address, pincode, phone)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
     [orderId, full_name, state, city, country, address, pincode, phone]
   );

   const paymentResponse = await generatePaymentIntent(orderId, total_price);

   if (!paymentResponse.success) {
     return next(new ErrorHandler("Payment failed. Try again.", 500));
   }

   res.status(200).json({
     success: true,
     message: "Order placed successfully. Please proceed to payment.",
     paymentIntent: paymentResponse.clientSecret,
     total_price,
     orderId,
   });
 });

export const verifyPayment = catchAsyncError(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(
      new ErrorHandler("Payment verification failed. Missing required payment parameters.", 400)
    );
  }

  const keySecret = (process.env.RAZORPAY_KEY_SECRET || "73gcYAaRvCuWgT8HC84Hh1Vm").trim();
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    console.error("Signature verification failed:", {
      generatedSignature,
      receivedSignature: razorpay_signature,
      razorpay_order_id,
      razorpay_payment_id,
    });
    return next(new ErrorHandler("Invalid payment signature. Verification failed.", 400));
  }

  // Update payment record in database
  const paymentTableUpdateResult = await database.query(
    `UPDATE payments SET payment_status = $1 WHERE payment_intent_id = $2 RETURNING *`,
    ["Paid", razorpay_order_id]
  );

  let orderId = null;
  if (paymentTableUpdateResult.rows.length > 0) {
    orderId = paymentTableUpdateResult.rows[0].order_id;
  } else {
    const existing = await database.query(
      `SELECT * FROM payments WHERE payment_intent_id = $1`,
      [razorpay_order_id]
    );
    if (existing.rows.length > 0) {
      orderId = existing.rows[0].order_id;
    }
  }

  if (orderId) {
    // Mark order as paid
    await database.query(
      `UPDATE orders SET paid_at = NOW() WHERE id = $1 RETURNING *`,
      [orderId]
    );

    // Deduct stock for each item in the order
    try {
      const { rows: orderedItems } = await database.query(
        `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
        [orderId]
      );

      for (const item of orderedItems) {
        await database.query(
          `UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }
    } catch (stockErr) {
      console.error("Stock update error:", stockErr);
    }
  }

  res.status(200).json({
    success: true,
    message: "Payment verified and order finalized successfully.",
    orderId: orderId || razorpay_order_id,
  });
});

export const fetchSingleOrder = catchAsyncError(async( req, res, next) =>{
    const { orderId } = req.params;
    const result = await database.query(`
        
    SELECT o.*, COALESCE(
 json_agg(
  json_build_object(
 'order_item_id', oi.id,
 'order_id', oi.order_id,
 'product_id', oi.product_id,
 'quantity', oi.quantity,
 'price', oi.price,
 'image', oi.image,
 'title', oi.title
  ) 
 ) FILTER (WHERE oi.id IS NOT NULL), '[]'
 ) AS order_items,
json_build_object(
 'full_name', s.full_name,
 'state', s.state,
 'city', s.city,
 'country', s.country,
 'address', s.address,
 'pincode', s.pincode,
 'phone', s.phone
 ) AS shipping_info 
 FROM orders o
 LEFT JOIN order_items oi ON o.id = oi.order_id
 LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.id = $1 AND o.buyer_id = $2
GROUP BY o.id, s.id
        `,
    [orderId, req.user.id]
  );

  res.status(200).json({
    success: true,
    message: " orders fetched.",
    orders: result.rows[0],
  });

});

export const fetchMyOrders = catchAsyncError(async(req, res, next) =>{
   const result = await database.query(
    `
        SELECT o.*, COALESCE(
 json_agg(
  json_build_object(
 'order_item_id', oi.id,
 'order_id', oi.order_id,
 'product_id', oi.product_id,
 'quantity', oi.quantity,
 'price', oi.price,
 'image', oi.image,
 'title', oi.title
  ) 
 ) FILTER (WHERE oi.id IS NOT NULL), '[]'
 ) AS order_items,
json_build_object(
 'full_name', s.full_name,
 'state', s.state,
 'city', s.city,
 'country', s.country,
 'address', s.address,
 'pincode', s.pincode,
 'phone', s.phone
 ) AS shipping_info 
 FROM orders o
 LEFT JOIN order_items oi ON o.id = oi.order_id
 LEFT JOIN shipping_info s ON o.id = s.order_id
WHERE o.buyer_id = $1
GROUP BY o.id, s.id
        `,
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    message: "All your orders are fetched.",
    myOrders: result.rows,
  });
})

export const fetchAllOrders = catchAsyncError(async(req, res, next) => {
    const result = await database.query(`
            SELECT o.*,
 COALESCE(json_agg(
 json_build_object(
 'order_item_id', oi.id,
 'order_id', oi.order_id,
 'product_id', oi.product_id,
 'quantity', oi.quantity,
 'price', oi.price,
 'image', oi.image,
 'title', oi.title
)
) FILTER (WHERE oi.id IS NOT NULL), '[]' ) AS order_items, json_build_object(
'full_name', s.full_name,
 'state', s.state,
 'city', s.city,
 'country', s.country,
 'address', s.address,
 'pincode', s.pincode,
 'phone', s.phone 
) AS shipping_info
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN shipping_info s ON o.id = s.order_id
GROUP BY o.id, s.id
        `);

  res.status(200).json({
    success: true,
    message: "All orders fetched.",
    orders: result.rows,
  }); 
});
export const updateOrderStatus = catchAsyncError(async(req, res, next) =>{
   const {status} = req.body;
   if(!status){
    return next(new ErrorHandler("Provide a valid status for order.", 400));
   }
   const { orderId } = req.params;
   const result = await database.query(`
    SELECT * FROM orders WHERE id = $1
    `,
    [orderId]
  );
  if(result.rows.length === 0){
    return next(new ErrorHandler("Invalid order ID.", 404));
  }

  const updatedOrder = await database.query(`
       UPDATE orders SET order_status = $1 WHERE id = $2 RETURNING *
    `,
    [status, orderId]
);
res.status(200).json({
    success: true, 
    message: "order status updated.",
    updatedOrder: updatedOrder.rows[0],
});
});
export const deleteOrder = catchAsyncError(async(req, res, next) =>{
  const {orderId} = req.params;
  const results = await database.query(`
    DELETE FROM orders WHERE id = $1 RETURNING *
    `,
    [orderId]
);
if(results.rows.length === 0){
    return next(new ErrorHandler("Invalid order Id.", 404));
}

res.status(200).json({
    success: true,
    message: "order deleted",
    order: results.rows[0],
})
})

export const deletePendingOrder = catchAsyncError(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  // Validate UUID format early to avoid DB errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orderId)) {
    return next(new ErrorHandler("Invalid order ID format.", 400));
  }

  // Confirm order belongs to this user and payment is still Pending
  const orderCheck = await database.query(
    `SELECT o.id, o.paid_at, p.payment_status
     FROM orders o
     LEFT JOIN payments p ON p.order_id = o.id
     WHERE o.id = $1 AND o.buyer_id = $2`,
    [orderId, userId]
  );

  if (orderCheck.rows.length === 0) {
    return next(new ErrorHandler("Order not found or access denied.", 404));
  }

  const { payment_status, paid_at } = orderCheck.rows[0];

  // Block deletion if the order is already paid
  if (payment_status === "Paid" || paid_at !== null) {
    return next(
      new ErrorHandler(
        "Cannot delete a paid order. Please contact support.",
        400
      )
    );
  }

  // All child tables have ON DELETE CASCADE, so deleting orders is enough.
  // Explicit deletes are kept for safety in case CASCADE was not applied retroactively.
  await database.query(`DELETE FROM payments WHERE order_id = $1`, [orderId]);
  await database.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
  await database.query(`DELETE FROM shipping_info WHERE order_id = $1`, [orderId]);
  const result = await database.query(
    `DELETE FROM orders WHERE id = $1 RETURNING *`,
    [orderId]
  );

  if (result.rows.length === 0) {
    return next(new ErrorHandler("Order could not be deleted. Please try again.", 500));
  }

  res.status(200).json({
    success: true,
    message: "Pending order cancelled and deleted successfully.",
    order: result.rows[0],
  });
});