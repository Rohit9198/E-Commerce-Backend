import pkg from "pg";
const { client } = pkg;


const database = new client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

try{
    await database.connect();
    console.log("connected to the database successfully");
}catch(error){
    console.error("Database connection failed:", error);
    process.exit(1);
}

export default database;