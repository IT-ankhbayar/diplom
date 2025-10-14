import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function POST(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { params } = context;
  const { userId } = params;
  if (!userId || Array.isArray(userId) || typeof userId !== 'string') {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }
  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) {
  const { params } = context;
  const { userId } = params;
  if (!userId || Array.isArray(userId) || typeof userId !== 'string') {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }
  const body = await request.json();
  const { verified, verificationImage } = body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(verified !== undefined && { verified }),
        ...(verificationImage !== undefined && { verificationImage }),
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
