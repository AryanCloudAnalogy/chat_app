import { NextResponse } from "next/server";
import admin from "@/app/config/firebaseAdmin";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { token } = await request.json();
  if (!token) {
    return NextResponse.json(
      { error: "ID token is required" },
      { status: 400 },
    );
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Extract user information
    const uid = decodedToken.uid;
    const email = decodedToken.email?.toLowerCase();
    // console.log("Email:", email);
    const name = decodedToken.name;
    const photoUrl = decodedToken.picture;

    const db = admin.firestore();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    let userData = {} as any;
    if (!userSnap.exists) {
      userData = { uid, email, name, photoUrl };
      await userRef.set(userData);
    } else {
      userData = userSnap.data();
      if (!userData.photoUrl && photoUrl) {
        userData = { ...userData, photoUrl };
        await userRef.set({ photoUrl }, { merge: true });
      }
    }

    const accessToken = jwt.sign(
      { uid: userData.uid, email: userData.email, name: userData.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { uid: userData.uid, email: userData.email, name: userData.name },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      message: "Sign-in successful",
      user: userData,
    });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json({ error: "Invalid ID token" }, { status: 401 });
  }
}
