import { NextResponse } from "next/server";
import { sendOTPEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // In a real app, you'd store this OTP in a database or Redis with an expiry.

        await sendOTPEmail(email, otp);

        return NextResponse.json({ message: "OTP sent successfully!", otp_sent: true });
    } catch (error) {
        console.error("Login OTP error:", error);
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}
