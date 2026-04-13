import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function requireCurrentUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      currentUser: null,
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  return {
    currentUser,
    error: null,
  };
}

export async function requireAdminUser() {
  const { currentUser, error } = await requireCurrentUser();

  if (error) {
    return {
      currentUser: null,
      error,
    };
  }

  if (currentUser.role !== "admin") {
    return {
      currentUser: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    currentUser,
    error: null,
  };
}
