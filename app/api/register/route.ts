import bcrypt from "bcrypt";
import prisma from "@/app/libs/prismadb";
import { NextResponse } from "next/server";

export async function POST(
    request: Request
) {
    const body = await request.json();
    const {
        email,
        name,
        password
    } = body;

    if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma?.user.create({
        data: {
            email,
            name,
            hashedPassword,
            role: "user" 
        }
    });

    return NextResponse.json(user);
}