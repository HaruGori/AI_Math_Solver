import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TagInput } from "@/components/tag-input";

describe("TagInput", () => {
	it("renders input field", () => {
		render(<TagInput tags={[]} onTagsChange={() => {}} />);
		const input = screen.getByPlaceholderText("タグを入力してEnterキーを押す");
		expect(input).toBeInTheDocument();
	});

	it("adds a tag on Enter key", async () => {
		const user = userEvent.setup();
		const onTagsChange = vi.fn();
		render(<TagInput tags={[]} onTagsChange={onTagsChange} />);

		const input = screen.getByPlaceholderText("タグを入力してEnterキーを押す");
		await user.type(input, "微分積分{Enter}");

		expect(onTagsChange).toHaveBeenCalledWith(["微分積分"]);
	});

	it("does not add duplicate tags", async () => {
		const user = userEvent.setup();
		const onTagsChange = vi.fn();
		render(<TagInput tags={["微分積分"]} onTagsChange={onTagsChange} />);

		const input = screen.getByRole("textbox");
		await user.type(input, "微分積分{Enter}");

		expect(onTagsChange).not.toHaveBeenCalled();
	});

	it("removes a tag when remove button is clicked", async () => {
		const user = userEvent.setup();
		const onTagsChange = vi.fn();
		render(
			<TagInput tags={["微分積分", "確率"]} onTagsChange={onTagsChange} />,
		);

		const removeButtons = screen.getAllByRole("button");
		await user.click(removeButtons[0]);

		expect(onTagsChange).toHaveBeenCalledWith(["確率"]);
	});

	it("removes last tag on Backspace when input is empty", async () => {
		const user = userEvent.setup();
		const onTagsChange = vi.fn();
		render(
			<TagInput tags={["微分積分", "確率"]} onTagsChange={onTagsChange} />,
		);

		const input = screen.getByRole("textbox");
		await user.type(input, "{Backspace}");

		expect(onTagsChange).toHaveBeenCalledWith(["微分積分"]);
	});
});
