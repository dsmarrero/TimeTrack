import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";
import { prisma } from "./prisma";
import { Employee } from "../app/generated/prisma/client";
import { SESSION_COOKIE_NAME } from "./session-constants";

export { SESSION_COOKIE_NAME };

export async function getCurrentEmployee(): Promise<Employee | null> {
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
