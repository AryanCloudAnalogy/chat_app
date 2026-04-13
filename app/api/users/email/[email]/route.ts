import { NextRequest, NextResponse } from "next/server";
import admin from "@/app/config/firebaseAdmin";
import { verifyAuthToken } from "@/app/utills/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } },
) {
  try {
    const user = await verifyAuthToken(request);
    const mail = (await params).email;
    const email = mail.toLowerCase();
    console.log(email);

    if (!email)
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    const db = admin.firestore();
    const snap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    if (snap.empty)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(snap.docs[0].data());
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
