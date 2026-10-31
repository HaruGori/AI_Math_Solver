import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/header";

vi.mock("next-auth/react", () => ({
	useSession: () => ({
		data: { user: { name: "Test User" } },
		status: "authenticated" as const,
	}),
	signIn: vi.fn(),
	signOut: vi.fn(),
}));

describe("Header", () => {
	it("renders logo and app name", () => {
		render(<Header />);
		expect(screen.getByText("AI 数学ソルバー")).toBeInTheDocument();
	});

	it("renders navigation links", () => {
		render(<Header />);
		expect(screen.getByText("問題一覧")).toBeInTheDocument();
		expect(screen.getByText("タグ管理")).toBeInTheDocument();
		expect(screen.getByText("問題をアップロード")).toBeInTheDocument();
	});

	it("renders sheet trigger button for mobile", () => {
		const { container } = render(<Header />);
		const sheetTrigger = container.querySelector(
			'button[data-slot="sheet-trigger"]',
		);
		expect(sheetTrigger).toBeInTheDocument();
	});

	it("applies hover class to navigation links", () => {
		render(<Header />);
		const problemLink = screen.getByRole("link", { name: "問題一覧" });
		const tagLink = screen.getByRole("link", { name: "タグ管理" });
		const uploadLink = screen.getByRole("link", { name: "問題をアップロード" });

		expect(problemLink.className).toContain("hover");
		expect(tagLink.className).toContain("hover");
		expect(uploadLink.className).toContain("hover");
	});

	it("renders user auth form in header", () => {
		render(<Header />);
		expect(screen.getByText(/こんにちは、Test Userさん/)).toBeInTheDocument();
	});
});
