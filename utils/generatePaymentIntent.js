import databse from "../database/db.js";
import razorpay from "razorpay";

const razorpay = razorpay(process.env.RAZORPAY_KEY_SECRET);

export async function generatePaymentIntent(orderId, totalPrice){
    try{
      const paymentIntent = await razorpay.paymentIntents.create({
        amount: totalPrice * 100,
        currency: "usd"
      })

       await databse.query("INSERT INTO payments (order_id, payment_type, payment_status, payment_intent_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [orderId, "online", "pending", paymentIntent.client_secret]
       );

       return {success: true, clientSecret: paymentIntent.client_secret };

    }catch(error){
        console.error("Payment Error:", error.message || error);
        return {success: false, message: "Payment Failed."}

    }
}