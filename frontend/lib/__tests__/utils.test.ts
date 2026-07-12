import { cn } from "@/lib/utils";

describe("cn", () => {
	it("merges class names", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("handles conditional classes", () => {
		expect(cn("base", false && "hidden", "visible")).toBe("base visible");
	});

	it("merges Tailwind classes (later wins)", () => {
		expect(cn("px-2", "px-4")).toBe("px-4");
	});

	it("handles undefined and null", () => {
		expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
	});
});
