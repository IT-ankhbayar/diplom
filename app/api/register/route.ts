import bcrypt from "bcryptjs";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function POST(
    request: Request
) {
    try {
        const body = await request.json();
        const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
        const name = typeof body?.name === "string" ? body.name.trim() : null;
        const password = typeof body?.password === "string" ? body.password : "";

        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
        }

        if (!password) {
            return NextResponse.json({ error: "Password is required." }, { status: 400 });
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            return NextResponse.json(
                { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` },
                { status: 400 }
            );
        }

        if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            return NextResponse.json(
                { error: "Password must include at least one letter and one number." },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                hashedPassword,
                role: "user"
            }
        });

        return NextResponse.json(user);
    } catch (error: unknown) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Failed to register user." }, { status: 500 });
    }
}
