'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function logout() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionCookie) {
    try {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
      await adminAuth.revokeRefreshTokens(decodedToken.sub);
    } catch {
      // Sesión ya inválida/expirada: nada que revocar, seguimos y limpiamos la cookie igual.
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
