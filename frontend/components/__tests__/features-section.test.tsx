import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeaturesSection } from "@/components/features-section";

describe("FeaturesSection", () => {
	it("renders main heading and description", () => {
		render(<FeaturesSection />);
		expect(screen.getByText("学習を加速する機能")).toBeInTheDocument();
		expect(
			screen.getByText(
				"数学の学習に必要な機能を、シンプルで使いやすいインターフェースで提供します。",
			),
		).toBeInTheDocument();
	});

	it("renders all feature cards with titles and descriptions", () => {
		render(<FeaturesSection />);

		expect(screen.getByText("簡単アップロード")).toBeInTheDocument();
		expect(
			screen.getByText(
				"写真を撮るか、文章で入力するだけ。数学の問題を素早く登録できます。",
			),
		).toBeInTheDocument();

		expect(screen.getByText("AI解説生成")).toBeInTheDocument();
		expect(
			screen.getByText(
				"AIが問題を分析し、わかりやすい解説を自動生成。学習をサポートします。",
			),
		).toBeInTheDocument();

		expect(screen.getByText("タグで整理")).toBeInTheDocument();
		expect(
			screen.getByText(
				"分野や難易度でタグ付け。必要な問題をすぐに見つけられます。",
			),
		).toBeInTheDocument();

		expect(screen.getByText("いつでも復習")).toBeInTheDocument();
		expect(
			screen.getByText(
				"保存した問題と解説はいつでも閲覧可能。効率的な復習をサポートします。",
			),
		).toBeInTheDocument();
	});
});
