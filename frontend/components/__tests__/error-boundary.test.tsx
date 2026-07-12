import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "@/components/error-boundary";

const ThrowError = () => {
	throw new Error("Test error");
};

describe("ErrorBoundary", () => {
	it("renders children when no error occurs", () => {
		render(
			<ErrorBoundary>
				<div>正常な内容</div>
			</ErrorBoundary>,
		);
		expect(screen.getByText("正常な内容")).toBeInTheDocument();
	});

	it("renders error fallback when child throws", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		);

		expect(
			screen.getByText("予期しないエラーが発生しました"),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"アプリケーションで問題が発生しました。再読み込みをお試しください。",
			),
		).toBeInTheDocument();
	});

	it("displays error details when toggle button is clicked", async () => {
		const user = userEvent.setup();
		vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		);

		await user.click(screen.getByText("詳細を表示"));
		expect(screen.getByText("詳細を隠す")).toBeInTheDocument();

		const errorText = screen.getByText((content) =>
			content.includes("Test error"),
		);
		expect(errorText).toBeInTheDocument();
	});

	it("shows retry button in fallback", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary>
				<ThrowError />
			</ErrorBoundary>,
		);

		expect(screen.getByText("再読み込み")).toBeInTheDocument();
	});

	it("uses custom fallback when provided", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});

		render(
			<ErrorBoundary fallback={<div>カスタムフォールバック</div>}>
				<ThrowError />
			</ErrorBoundary>,
		);

		expect(screen.getByText("カスタムフォールバック")).toBeInTheDocument();
	});
});
