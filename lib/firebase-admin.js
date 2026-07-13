import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../firebase-service-account.json";

const adminApp = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });

export const adminAuth = getAuth(adminApp);
