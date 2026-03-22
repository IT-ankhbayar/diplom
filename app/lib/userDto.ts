import type { User } from "@prisma/client";

export type SafeUserDto = Omit<User, "hashedPassword" | "createdAt" | "updatedAt" | "emailVerified"> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
};

export function toSafeUserDto(user: User): SafeUserDto {
  const { hashedPassword: _hashedPassword, createdAt, updatedAt, emailVerified, ...safeUser } = user;

  return {
    ...safeUser,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    emailVerified: emailVerified?.toISOString() ?? null,
  };
}
