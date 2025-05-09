import mysql from "mysql2/promise";

export async function getConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "alexandru123!",
    database: process.env.DB_NAME || "magazindevile",
  });
}
