import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { createTables } from "./utils/createTables.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import authRouter from "./router/authRoutes.js";
import productRouter from "./router/productRoutes.js";
import adminRouter from "./router/adminRoutes.js";
import orderRouter from "./router/orderRoutes.js";
import database from "./database/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

config({ path: path.join(__dirname, "config/config.env") });


const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3000",
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.post("/api/v1/payment/webhook",
    express.raw({type: "application/json"}),
    async(req, res) =>{
        const sig = req.headers["razorpay-signature"];
        let event;
        try{
           event = JSON.parse(req.body.toString());
        }catch(error){
           return res.status(400).send(`webhook Error: ${error.message || error}`);
        }

        //Handling the event

        if(event && event.type === "payment_intent.succeeded"){
            const paymentIntent_client_secret = event.data.object.client_secret;
            try{
              // Finding and updated payment
              const updatedPaymentStatus = "Paid";
              const paymentTableUpdateResult = await database.query(`UPDATE payments SET payment_status = $1
                WHERE payment_intent_id = $2 RETURNING *`,[updatedPaymentStatus, paymentIntent_client_secret]
            );
             await database.query(`UPDATE orders SET paid_at = NOW() WHERE id = $1 RETURNING *`,
                [paymentTableUpdateResult.rows[0].order_id]
            );

            //Reduce stock for each Product
            const orderId = paymentTableUpdateResult.rows[0].order_id;
            const {rows: orderedItems} = await database.query(`
                SELECT product_id, quantity FROM order_items WHERE order_id = $1
                `,[orderId]
            );

            //For each ordered item, reduce the product stock
            for (const item of orderedItems){
                await database.query(
                    `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                    [item.quantity, item.product_id]
                );
            }

            }catch(error){
              return res.status(500).send(`Error updating paid_at timestamp in orders table.`);
            }
        }
        res.status(200).send({ received: true});
    }
)


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use(
    fileUpload({
        tempFileDir: "./uploads",
        useTempFiles: true,
    })
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/order", orderRouter);

createTables();

app.use(errorMiddleware);

export default app;