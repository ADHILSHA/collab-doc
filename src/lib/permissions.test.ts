import { describe, expect, it } from "vitest";
import { canAccessDocument, isOwner } from "./permissions";

describe("canAccessDocument", () => {
  const doc = { ownerId: "alice", shares: [{ userId: "bob" }] };

  it("grants access to the owner", () => {
    expect(canAccessDocument("alice", doc)).toBe(true);
  });

  it("grants access to a user the document is shared with", () => {
    expect(canAccessDocument("bob", doc)).toBe(true);
  });

  it("denies access to a user who is neither owner nor shared with", () => {
    expect(canAccessDocument("carol", doc)).toBe(false);
  });

  it("denies access when there are no shares at all", () => {
    expect(
      canAccessDocument("carol", { ownerId: "alice", shares: [] }),
    ).toBe(false);
  });
});

describe("isOwner", () => {
  it("returns true for the owner", () => {
    expect(isOwner("alice", { ownerId: "alice" })).toBe(true);
  });

  it("returns false for a shared, non-owner user", () => {
    expect(isOwner("bob", { ownerId: "alice" })).toBe(false);
  });
});
