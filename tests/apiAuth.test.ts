import { beforeEach, describe, expect, it, vi } from "vitest";

const { getCurrentUserMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
}));

vi.mock("@/app/actions/getCurrentUser", () => ({
  default: getCurrentUserMock,
}));

import { requireAdminUser, requireCurrentUser } from "@/app/lib/apiAuth";

describe("admin auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    const result = await requireCurrentUser();

    expect(result.currentUser).toBeNull();
    expect(result.error?.status).toBe(401);
  });

  it("rejects authenticated non-admin users", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: "user-1",
      role: "user",
    });

    const result = await requireAdminUser();

    expect(result.currentUser).toBeNull();
    expect(result.error?.status).toBe(403);
  });

  it("allows admin users through", async () => {
    getCurrentUserMock.mockResolvedValue({
      id: "admin-1",
      role: "admin",
    });

    const result = await requireAdminUser();

    expect(result.error).toBeNull();
    expect(result.currentUser).toEqual({
      id: "admin-1",
      role: "admin",
    });
  });
});
