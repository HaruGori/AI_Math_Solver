import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TagCard } from "@/components/tag-card";

describe("TagCard", () => {
	it("renders tag name and count in view mode", () => {
		render(<TagCard tag="代数" count={5} />);
		expect(screen.getByText("代数")).toBeInTheDocument();
		expect(screen.getByText("5件の問題")).toBeInTheDocument();
	});

	it("has a link to filtered problems page", () => {
		render(<TagCard tag="代数" count={3} />);
		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/problems?tag=%E4%BB%A3%E6%95%B0");
	});

	it("shows edit and delete buttons on hover", () => {
		render(
			<TagCard tag="代数" count={3} onDelete={vi.fn()} onUpdate={vi.fn()} />,
		);
		const buttons = screen.getAllByRole("button");
		expect(buttons).toHaveLength(2);
	});

	it("does not show edit button when onUpdate is not provided", () => {
		render(<TagCard tag="代数" count={3} />);
		const editButtons = screen.queryAllByRole("button");
		expect(editButtons).toHaveLength(0);
	});

	it("does not show delete button when onDelete is not provided", () => {
		render(<TagCard tag="代数" count={3} />);
		const deleteButtons = screen.queryAllByRole("button");
		expect(deleteButtons).toHaveLength(0);
	});

	it("switches to edit mode on edit button click", async () => {
		const user = userEvent.setup();
		render(
			<TagCard tag="代数" count={3} onUpdate={vi.fn()} onDelete={vi.fn()} />,
		);
		const editButton = screen.getAllByRole("button")[0];
		await user.click(editButton);

		const input = screen.getByDisplayValue("代数");
		expect(input).toBeInTheDocument();
		expect(screen.getByText("保存")).toBeInTheDocument();
		expect(screen.getByText("キャンセル")).toBeInTheDocument();
	});

	it("calls onUpdate when save is clicked with new name", async () => {
		const user = userEvent.setup();
		const onUpdate = vi.fn();
		render(
			<TagCard tag="代数" count={3} onUpdate={onUpdate} onDelete={vi.fn()} />,
		);
		await user.click(screen.getAllByRole("button")[0]);

		const input = screen.getByDisplayValue("代数");
		await user.clear(input);
		await user.type(input, "幾何");
		await user.click(screen.getByText("保存"));

		expect(onUpdate).toHaveBeenCalledWith("代数", "幾何");
	});

	it("does not call onUpdate when name is unchanged", async () => {
		const user = userEvent.setup();
		const onUpdate = vi.fn();
		render(
			<TagCard tag="代数" count={3} onUpdate={onUpdate} onDelete={vi.fn()} />,
		);
		await user.click(screen.getAllByRole("button")[0]);
		await user.click(screen.getByText("保存"));

		expect(onUpdate).not.toHaveBeenCalled();
	});

	it("reverts to original name on cancel", async () => {
		const user = userEvent.setup();
		render(
			<TagCard tag="代数" count={3} onUpdate={vi.fn()} onDelete={vi.fn()} />,
		);
		await user.click(screen.getAllByRole("button")[0]);

		const input = screen.getByDisplayValue("代数");
		await user.clear(input);
		await user.type(input, "幾何");
		await user.click(screen.getByText("キャンセル"));

		expect(screen.getByText("代数")).toBeInTheDocument();
	});

	it("calls onDelete when delete button is clicked", async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		render(
			<TagCard tag="代数" count={3} onUpdate={vi.fn()} onDelete={onDelete} />,
		);
		const deleteButton = screen.getAllByRole("button")[1];
		await user.click(deleteButton);

		expect(onDelete).toHaveBeenCalledWith("代数");
	});

	it("shows loading spinner when isUpdating is true", async () => {
		const user = userEvent.setup();
		render(
			<TagCard
				tag="代数"
				count={3}
				onUpdate={vi.fn()}
				onDelete={vi.fn()}
				isUpdating={true}
			/>,
		);
		await user.click(screen.getAllByRole("button")[0]);

		const spinner = document.querySelector(".animate-spin");
		expect(spinner).toBeInTheDocument();
	});

	it("shows loading spinner when isDeleting is true", () => {
		render(
			<TagCard tag="代数" count={3} onDelete={vi.fn()} isDeleting={true} />,
		);
		const spinner = document.querySelector(".animate-spin");
		expect(spinner).toBeInTheDocument();
	});

	it("saves on Enter key in edit mode", async () => {
		const user = userEvent.setup();
		const onUpdate = vi.fn();
		render(
			<TagCard tag="代数" count={3} onUpdate={onUpdate} onDelete={vi.fn()} />,
		);
		await user.click(screen.getAllByRole("button")[0]);

		const input = screen.getByDisplayValue("代数");
		await user.clear(input);
		await user.type(input, "幾何{Enter}");

		expect(onUpdate).toHaveBeenCalledWith("代数", "幾何");
	});

	it("cancels on Escape key in edit mode", async () => {
		const user = userEvent.setup();
		render(
			<TagCard tag="代数" count={3} onUpdate={vi.fn()} onDelete={vi.fn()} />,
		);
		await user.click(screen.getAllByRole("button")[0]);

		const input = screen.getByDisplayValue("代数");
		await user.clear(input);
		await user.type(input, "幾何{Escape}");

		expect(screen.getByText("代数")).toBeInTheDocument();
	});
});
