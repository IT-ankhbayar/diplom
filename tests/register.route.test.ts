import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  bcryptMock: {
    hash: vi.fn(),
  },
}));

vi.mock("@/app/libs/prismadb", () => ({
  default: prismaMock,
}));

vi.mock("bcryptjs", () => ({
  default: bcryptMock,
  hash: bcryptMock.hash,
}));

import { POST } from "@/app/api/register/route";

describe("POST /api/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a sanitized user DTO after successful registration", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue("hashed-value");
    prismaMock.user.create.mockResolvedValue({
      id: "user-1",
      email: "alice@example.com",
      name: "Alice",
      image: null,
      hashedPassword: "hashed-value",
      createdAt: new Date("2026-03-20T00:00:00.000Z"),
      updatedAt: new Date("2026-03-20T00:00:00.000Z"),
      emailVerified: null,
      favoriteIds: [],
      role: "user",
      verified: false,
      verificationImage: null,
    });

    const response = await POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({
          email: " Alice@Example.com ",
          name: "Alice",
          password: "abc12345",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "alice@example.com",
          hashedPassword: "hashed-value",
        }),
      })
    );

    await expect(response.json()).resolves.toEqual({
      id: "user-1",
      email: "alice@example.com",
      name: "Alice",
      image: null,
      createdAt: "2026-03-20T00:00:00.000Z",
      updatedAt: "2026-03-20T00:00:00.000Z",
      emailVerified: null,
      favoriteIds: [],
      role: "user",
      verified: false,
      verificationImage: null,
    });
  });

  it("rejects duplicate registrations", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "existing-user" });

    const response = await POST(
      new Request("http://localhost/api/register", {
        method: "POST",
        body: JSON.stringify({
          email: "alice@example.com",
          password: "abc12345",
        }),
      })
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "An account with this email already exists.",
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});
