import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";
import { prisma } from "./prisma";

export const SESSION_COOKIE_NAME = "session";

export async function getCurrentEmployee() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
  } catch {
    return null;
  }

  const employee = await prisma.employee.findUnique({
    where: { email: decodedToken.email },
  });

  return employee;
}
