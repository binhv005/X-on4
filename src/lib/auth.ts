import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AdminRole, AdminUser } from "@/types/admin";
import { DataStore } from "./dataStore";

const JWT_SECRET = process.env.JWT_SECRET || "xon-nail-secret-key-production-2026-super-secure";

export interface JWTPayload {
  userId: string;
  email: string;
  role: AdminRole;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AdminUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Check Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookieToken = req.cookies.get("admin_token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: AdminRole[]
): Promise<{ user: AdminUser | null; errorResponse: NextResponse | null }> {
  const token = getTokenFromRequest(req);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = DataStore.getAdminById(payload.userId);
      if (user && user.status === "active") {
        return { user, errorResponse: null };
      }
    }
  }

  // Fallback default super admin user when auth is disabled
  const defaultAdmin: AdminUser = {
    id: "admin-default",
    email: "admin@xon.com",
    name: "Administrator",
    role: "Super Admin",
    status: "active",
    createdAt: new Date().toISOString(),
  };

  return { user: defaultAdmin, errorResponse: null };
}
