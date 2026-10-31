import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SolutionDisplay } from "@/components/solution-display";

describe("SolutionDisplay", () => {
	it("renders title", () => {
		render(<SolutionDisplay solution="test" />);
		expect(screen.getByText("AI生成の解説")).toBeInTheDocument();
	});

	it("renders plain text paragraph", () => {
		render(<SolutionDisplay solution="これは解説文です。" />);
		expect(screen.getByText("これは解説文です。")).toBeInTheDocument();
	});

	it("renders heading formatted with ** **", () => {
		render(<SolutionDisplay solution="**手順1**" />);
		expect(screen.getByRole("heading", { name: "手順1" })).toBeInTheDocument();
	});

	it("renders math block with $$ $$", () => {
		render(
			<SolutionDisplay solution="$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$" />,
		);
		const mathBlock = screen.getByText(/\\frac\{-b/);
		expect(mathBlock).toBeInTheDocument();
	});

	it("renders list items with - prefix", () => {
		render(<SolutionDisplay solution={"- ステップ1\n- ステップ2"} />);
		expect(screen.getByText("ステップ1")).toBeInTheDocument();
		expect(screen.getByText("ステップ2")).toBeInTheDocument();
	});

	it("renders multiple paragraphs separated by blank lines", () => {
		render(<SolutionDisplay solution={"段落1\n\n段落2"} />);
		expect(screen.getByText("段落1")).toBeInTheDocument();
		expect(screen.getByText("段落2")).toBeInTheDocument();
	});

	it("renders mixed content", () => {
		const solution = [
			"**解説**",
			"この問題は二次方程式です。",
			"$$x = 1$$",
			"- ポイント1",
			"- ポイント2",
		].join("\n\n");

		render(<SolutionDisplay solution={solution} />);
		expect(screen.getByRole("heading", { name: "解説" })).toBeInTheDocument();
		expect(screen.getByText("この問題は二次方程式です。")).toBeInTheDocument();
		expect(screen.getByText("ポイント1")).toBeInTheDocument();
		expect(screen.getByText("ポイント2")).toBeInTheDocument();
	});

	it("handles empty solution", () => {
		const { container } = render(<SolutionDisplay solution="" />);
		expect(container.querySelector(".prose")).toBeInTheDocument();
	});

	it("handles solution with only whitespace", () => {
		render(<SolutionDisplay solution="   " />);
		expect(screen.getByText("AI生成の解説")).toBeInTheDocument();
	});
});
