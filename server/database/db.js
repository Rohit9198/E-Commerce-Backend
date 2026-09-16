import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../config/config.env") });

const database = new Client({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "E-commerce",
    password: process.env.DB_PASSWORD || "Rohit@1234",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

try{
    await database.connect();
    console.log("connected to the database successfully");
}catch(error){
    console.error("Database connection failed:", error);
    process.exit(1);
}

export default database;