import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getConnection } from "./db";
import { User } from "../types";
import { RowDataPacket } from "mysql2/promise";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
) {
  console.log("comparePasswords - Plain text password:", password);
  console.log("comparePasswords - Hashed password from DB:", hashedPassword);
  const match = await bcrypt.compare(password, hashedPassword);
  console.log("comparePasswords - bcrypt.compare result:", match);
  return match;
}

export function generateToken(userId: number, role: User["role"]) {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "7d" }
  );
}

export async function validateUser(email: string, password: string) {
  const conn = await getConnection();
  try {
    console.log("validateUser called with email:", email);
    const [rows] = await conn.execute<(RowDataPacket & User)[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      console.log("User not found for email:", email);
      return null;
    }

    const user = rows[0];
    console.log("User found in database:", user);

    const isValid = await comparePasswords(password, user.password);

    if (!isValid) {
      console.log("Password did not match for user:", email);
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  } finally {
    await conn.end();
  }
}
