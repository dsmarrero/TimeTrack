'use server'

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 días

export async function login(idToken) {
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    return { error: "No se pudo verificar el inicio de sesión" };
  }

const employee = await prisma.employee.findUnique({
   where: { email: decodedToken.email },
  }); 

  if (!employee || !employee.active) {
    return { error: "Tu cuenta no está activa o no tienes acceso" };
  }

 const sessionCookie = await adminAuth.createSessionCookie(idToken, {
  expiresIn: SESSION_EXPIRES_IN_MS,
  });
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return { error: null };
}
