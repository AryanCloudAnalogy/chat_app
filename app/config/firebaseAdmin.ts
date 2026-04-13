import admin from "firebase-admin";
import serviceAccountRaw from "@/app/config/serviceAccountKey.json";

const serviceAccount = {
  ...serviceAccountRaw,
  private_key: serviceAccountRaw.private_key.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  console.log("Firebase Admin initialized");
}

export default admin;
