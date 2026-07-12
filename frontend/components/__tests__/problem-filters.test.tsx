import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProblemFilters } from "@/components/problem-filters";

describe("ProblemFilters", () => {
	it("renders search input and tag badges", () => {
		render(
			<ProblemFilters
				onSearchChange={() => {}}
				onTagFilter={() => {}}
				availableTags={["代数", "幾何"]}
				selectedTag={null}
			/>,
		);
		expect(screen.getByPlaceholderText("問題を検索...")).toBeInTheDocument();
		expect(screen.getByText("すべて")).toBeInTheDocument();
		expect(screen.getByText("代数")).toBeInTheDocument();
		expect(screen.getByText("幾何")).toBeInTheDocument();
	});

	it("calls onSearchChange after debounce", async () => {
		const user = userEvent.setup();
		const onSearchChange = vi.fn();
		render(
			<ProblemFilters
				onSearchChange={onSearchChange}
				onTagFilter={() => {}}
				availableTags={[]}
				selectedTag={null}
			/>,
		);

		const input = screen.getByPlaceholderText("問題を検索...");
		await user.type(input, "二次方程式");

		expect(onSearchChange).not.toHaveBeenCalled();

		await vi.waitFor(
			() => {
				expect(onSearchChange).toHaveBeenCalledWith("二次方程式");
			},
			{ timeout: 1000 },
		);
	});

	it("calls onTagFilter when tag badge is clicked", async () => {
		const user = userEvent.setup();
		const onTagFilter = vi.fn();
		render(
			<ProblemFilters
				onSearchChange={() => {}}
				onTagFilter={onTagFilter}
				availableTags={["代数"]}
				selectedTag={null}
			/>,
		);

		await user.click(screen.getByText("代数"));
		expect(onTagFilter).toHaveBeenCalledWith("代数");
	});

	it("calls onTagFilter with null when 'すべて' is clicked", async () => {
		const user = userEvent.setup();
		const onTagFilter = vi.fn();
		render(
			<ProblemFilters
				onSearchChange={() => {}}
				onTagFilter={onTagFilter}
				availableTags={["代数"]}
				selectedTag="代数"
			/>,
		);

		await user.click(screen.getByText("すべて"));
		expect(onTagFilter).toHaveBeenCalledWith(null);
	});

	it("highlights selected tag as default variant", () => {
		render(
			<ProblemFilters
				onSearchChange={() => {}}
				onTagFilter={() => {}}
				availableTags={["代数"]}
				selectedTag="代数"
			/>,
		);

		const tagBadge = screen.getByText("代数");
		expect(tagBadge.className).toContain("cursor-pointer");
	});

	it("uses initialSearch value", () => {
		render(
			<ProblemFilters
				onSearchChange={() => {}}
				onTagFilter={() => {}}
				availableTags={[]}
				selectedTag={null}
				initialSearch="方程式"
			/>,
		);

		const input = screen.getByPlaceholderText("問題を検索...");
		expect(input).toHaveValue("方程式");
	});
});
