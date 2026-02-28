import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { email, name } = await req.json();

        if (!email || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // In a real app, you'd save the user to a database here.

        await sendWelcomeEmail(email, name);

        return NextResponse.json({ message: "Signup successful, welcome email sent!" });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
    }
}
