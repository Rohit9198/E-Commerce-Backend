import database from "../database/db.js";
import Razorpay from "razorpay";

export async function generatePaymentIntent(orderId, totalPrice) {
  try {
    const razorpayInstance = new Razorpay({
      key_id: (process.env.RAZORPAY_KEY_ID || "").trim(),
      key_secret: (process.env.RAZORPAY_KEY_SECRET || "").trim(),
    });

    const options = {
      amount: totalPrice * 100, // in paise
      currency: "INR",
      receipt: orderId,
    };

    const order = await razorpayInstance.orders.create(options);

    await database.query(
      `INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [orderId, "Online", "Pending", order.id]
    );

    return {
      success: true,
      clientSecret: order.id,
    };

  } catch (error) {
    console.error("Payment Error:", error.message || error);
    return { success: false, message: "Payment Failed." };
  }
}