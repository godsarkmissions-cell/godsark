import { NextRequest, NextResponse } from "next/server";

// This runs server-side only, so RAZORPAY_KEY_SECRET never reaches the browser.
// Install the "razorpay" npm package: npm install razorpay
export async function POST(req: NextRequest) {
  try {
    const { amount, currency } = await req.json();

    // Lazy import so the build doesn't fail before you've run `npm install razorpay`
    const Razorpay = (await import("razorpay")).default;
    const instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });

    const order = await instance.orders.create({
      amount, // in paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
