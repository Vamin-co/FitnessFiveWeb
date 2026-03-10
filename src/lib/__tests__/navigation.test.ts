import { describe, expect, it } from "vitest";
import { sanitizeInternalPath } from "@/lib/navigation";

describe("sanitizeInternalPath", () => {
    it("allows internal relative paths", () => {
        expect(sanitizeInternalPath("/dashboard?tab=today")).toBe("/dashboard?tab=today");
    });

    it("rejects absolute external URLs", () => {
        expect(sanitizeInternalPath("https://evil.com", "/login")).toBe("/login");
    });

    it("rejects protocol-relative URLs", () => {
        expect(sanitizeInternalPath("//evil.com/path")).toBe("/dashboard");
    });

    it("falls back when value is empty", () => {
        expect(sanitizeInternalPath(null, "/profile")).toBe("/profile");
    });
});
