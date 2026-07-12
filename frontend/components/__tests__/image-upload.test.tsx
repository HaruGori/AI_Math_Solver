import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ImageUpload } from "@/components/image-upload";

function createMockFile(name: string, size: number, type: string): File {
	const blob = new Blob(["a".repeat(size)], { type });
	return new File([blob], name, { type });
}

describe("ImageUpload", () => {
	it("renders upload area when no preview", () => {
		const { container } = render(
			<ImageUpload onImageChange={() => {}} value={null} />,
		);
		expect(screen.getByText("画像をアップロード")).toBeInTheDocument();
		expect(
			screen.getByText("クリックまたはドラッグ&ドロップ"),
		).toBeInTheDocument();
		const input = container.querySelector('input[type="file"]');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute("accept", "image/*");
	});

	it("renders preview and remove button after file selection", async () => {
		const user = userEvent.setup();
		const onImageChange = vi.fn();
		const { container } = render(
			<ImageUpload onImageChange={onImageChange} value={null} />,
		);

		const file = createMockFile("test.png", 100, "image/png");
		const input = container.querySelector('input[type="file"]')!;
		await user.upload(input, file);

		expect(onImageChange).toHaveBeenCalledWith(file);
	});
});
