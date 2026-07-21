import { cert, getApps, initializeApp, App,ServiceAccount } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import serviceAccount from "../firebase-service-account.json";

const adminApp: App = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount as ServiceAccount) });
export const adminAuth: Auth = getAuth(adminApp);
