import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "@/components/hero-section";

describe("HeroSection", () => {
	it("renders main heading, tagline, and call to action links", () => {
		render(<HeroSection />);

		expect(screen.getByText("解いて")).toBeInTheDocument();
		expect(screen.getByText("学んで")).toBeInTheDocument();
		expect(
			screen.getByText(
				"写真や文章で問題をアップロードし、AIが解説を作成。タグで整理して、いつでも見返せる学習プラットフォーム。",
			),
		).toBeInTheDocument();

		const uploadLink = screen.getByRole("link", {
			name: /問題をアップロード/,
		});
		expect(uploadLink).toHaveAttribute("href", "/upload");

		const problemsLink = screen.getByRole("link", {
			name: /問題を見る/,
		});
		expect(problemsLink).toHaveAttribute("href", "/problems");
	});

	it("renders math decoration symbols", () => {
		render(<HeroSection />);

		expect(screen.getByText("$$\\sum$$")).toBeInTheDocument();
		expect(screen.getByText("$$\\int$$")).toBeInTheDocument();
		expect(screen.getByText("$$\\pi$$")).toBeInTheDocument();
	});
});
