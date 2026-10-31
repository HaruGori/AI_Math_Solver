import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProblemCard } from "@/components/problem-card";
import type { Problem } from "@/lib/api";

const mockProblem: Problem = {
	id: 42,
	title: "二次方程式の解法",
	content: "x^2 + 5x + 6 = 0 を解け",
	content_type: "text",
	image_url: undefined,
	answer: "因数分解すると (x+2)(x+3)=0 より x=-2, -3",
	tags: [
		{ id: 1, name: "代数", created_at: "2026-01-01" },
		{ id: 2, name: "高校数学", created_at: "2026-01-01" },
	],
	created_at: "2026-07-01T12:00:00Z",
	updated_at: "2026-07-01T12:00:00Z",
};

describe("ProblemCard", () => {
	it("renders problem title, content, answer, tags, and date", () => {
		render(<ProblemCard problem={mockProblem} onDelete={vi.fn()} />);

		expect(screen.getByText("二次方程式の解法")).toBeInTheDocument();
		expect(screen.getByText("x^2 + 5x + 6 = 0 を解け")).toBeInTheDocument();
		expect(screen.getByText("AI解説:")).toBeInTheDocument();
		expect(
			screen.getByText("因数分解すると (x+2)(x+3)=0 より x=-2, -3"),
		).toBeInTheDocument();
		expect(screen.getByText("代数")).toBeInTheDocument();
		expect(screen.getByText("高校数学")).toBeInTheDocument();

		const expectedDate = new Date(mockProblem.created_at).toLocaleDateString(
			"ja-JP",
		);
		expect(screen.getByText(expectedDate)).toBeInTheDocument();
	});

	it("does not render AI answer section when answer is not provided", () => {
		const problemWithoutAnswer: Problem = {
			...mockProblem,
			answer: undefined,
		};

		render(<ProblemCard problem={problemWithoutAnswer} onDelete={vi.fn()} />);
		expect(screen.queryByText("AI解説:")).not.toBeInTheDocument();
	});

	it("links to the problem detail page", () => {
		render(<ProblemCard problem={mockProblem} onDelete={vi.fn()} />);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/problems/42");
	});

	it("calls onDelete with problem id when delete is confirmed in alert dialog", async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();

		render(<ProblemCard problem={mockProblem} onDelete={onDelete} />);

		// ゴミ箱アイコンボタンをクリックしてダイアログを開く
		const trashButton = screen.getByRole("button");
		await user.click(trashButton);

		// ダイアログ内容の確認
		expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
		expect(
			screen.getByText(/問題「二次方程式の解法」を完全に削除します。/),
		).toBeInTheDocument();

		// 「削除」ボタンをクリック
		const confirmButton = screen.getByRole("button", { name: "削除" });
		await user.click(confirmButton);

		expect(onDelete).toHaveBeenCalledWith(42);
	});

	it("does not call onDelete when cancel is clicked in alert dialog", async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();

		render(<ProblemCard problem={mockProblem} onDelete={onDelete} />);

		const trashButton = screen.getByRole("button");
		await user.click(trashButton);

		const cancelButton = screen.getByRole("button", { name: "キャンセル" });
		await user.click(cancelButton);

		expect(onDelete).not.toHaveBeenCalled();
	});
});
