import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UploadForm } from "@/components/upload-form";
import { ApiError, problemsApi, tagsApi, uploadApi } from "@/lib/api";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

const mockToast = vi.fn();
vi.mock("@hooks/use-toast", () => ({
	useToast: () => ({
		toast: mockToast,
	}),
}));
vi.mock("@/hooks/use-toast", () => ({
	useToast: () => ({
		toast: mockToast,
	}),
}));

vi.mock("@/lib/api", () => ({
	problemsApi: {
		createProblem: vi.fn(),
		generateAnswer: vi.fn(),
		getProblem: vi.fn(),
	},
	tagsApi: {
		getTags: vi.fn(),
		createTag: vi.fn(),
	},
	uploadApi: {
		uploadImage: vi.fn(),
	},
	ApiError: class extends Error {
		code: string;
		status?: number;
		constructor(message: string, code: string, status?: number) {
			super(message);
			this.code = code;
			this.status = status;
		}
	},
}));

vi.mock("@/components/image-upload", () => ({
	ImageUpload: ({
		onImageChange,
		value,
	}: {
		onImageChange: (file: File | null) => void;
		value: File | null;
	}) => (
		<div data-testid="image-upload">
			<button
				type="button"
				onClick={() =>
					onImageChange(new File(["dummy"], "test.png", { type: "image/png" }))
				}
			>
				Select File
			</button>
			{value && <span>Selected: {value.name}</span>}
		</div>
	),
}));

vi.mock("@/components/tag-input", () => ({
	TagInput: ({
		tags,
		onTagsChange,
	}: {
		tags: string[];
		onTagsChange: (tags: string[]) => void;
	}) => (
		<div data-testid="tag-input">
			<button type="button" onClick={() => onTagsChange([...tags, "新タグ"])}>
				Add Tag
			</button>
			<span>Tags: {tags.join(", ")}</span>
		</div>
	),
}));

vi.mock("@/components/solution-display", () => ({
	SolutionDisplay: ({ solution }: { solution: string }) => (
		<div data-testid="solution-display">{solution}</div>
	),
}));

describe("UploadForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders title input, tabs, and action buttons", () => {
		render(<UploadForm />);

		expect(screen.getByLabelText("問題のタイトル")).toBeInTheDocument();
		expect(screen.getByText("画像アップロード")).toBeInTheDocument();
		expect(screen.getByText("テキスト入力")).toBeInTheDocument();
		expect(screen.getByText("キャンセル")).toBeInTheDocument();

		const submitButton = screen.getByRole("button", { name: "問題を保存" });
		expect(submitButton).toBeDisabled();
	});

	it("navigates to home when cancel button is clicked", async () => {
		const user = userEvent.setup();
		render(<UploadForm />);

		const cancelButton = screen.getByRole("button", { name: "キャンセル" });
		await user.click(cancelButton);

		expect(mockPush).toHaveBeenCalledWith("/");
	});

	it("enables submit button when title is entered", async () => {
		const user = userEvent.setup();
		render(<UploadForm />);

		const titleInput = screen.getByLabelText("問題のタイトル");
		await user.type(titleInput, "微分方程式の問題");

		const submitButton = screen.getByRole("button", { name: "問題を保存" });
		expect(submitButton).not.toBeDisabled();
	});

	it("submits text problem and displays AI solution on success", async () => {
		const user = userEvent.setup();
		vi.mocked(tagsApi.getTags).mockResolvedValue([
			{ id: 1, name: "代数", created_at: "2026-01-01" },
		]);
		vi.mocked(tagsApi.createTag).mockResolvedValue({
			id: 2,
			name: "新タグ",
			created_at: "2026-01-01",
		});
		vi.mocked(problemsApi.createProblem).mockResolvedValue({
			id: 10,
			title: "三平方の定理",
			content: "直角三角形の斜辺を求めよ",
			content_type: "text",
			tags: [],
			created_at: "2026-01-01",
			updated_at: "2026-01-01",
		});
		vi.mocked(problemsApi.generateAnswer).mockResolvedValue({
			id: 10,
			title: "三平方の定理",
			content: "直角三角形の斜辺を求めよ",
			content_type: "text",
			answer: "a^2 + b^2 = c^2 より c = 5",
			tags: [],
			created_at: "2026-01-01",
			updated_at: "2026-01-01",
		});
		vi.mocked(problemsApi.getProblem).mockResolvedValue({
			id: 10,
			title: "三平方の定理",
			content: "直角三角形の斜辺を求めよ",
			content_type: "text",
			answer: "a^2 + b^2 = c^2 より c = 5",
			tags: [],
			created_at: "2026-01-01",
			updated_at: "2026-01-01",
		});

		render(<UploadForm />);

		// タイトル入力
		await user.type(screen.getByLabelText("問題のタイトル"), "三平方の定理");

		// テキストタブに切り替え
		await user.click(screen.getByText("テキスト入力"));

		// 問題文入力
		const textarea = screen.getByPlaceholderText("例: x² + 5x + 6 = 0 を解け");
		await user.type(textarea, "直角三角形の斜辺を求めよ");

		// タグ追加
		await user.click(screen.getByText("Add Tag"));

		// 送信
		const submitButton = screen.getByRole("button", { name: "問題を保存" });
		await user.click(submitButton);

		await waitFor(() => {
			expect(tagsApi.createTag).toHaveBeenCalledWith("新タグ");
			expect(problemsApi.createProblem).toHaveBeenCalledWith({
				title: "三平方の定理",
				content: "直角三角形の斜辺を求めよ",
				content_type: "text",
				image_url: undefined,
				tag_ids: [2],
			});
			expect(problemsApi.generateAnswer).toHaveBeenCalledWith(10);
			expect(problemsApi.getProblem).toHaveBeenCalledWith(10);
		});

		expect(mockToast).toHaveBeenCalledWith({
			title: "問題を保存しました",
			description: "AI解説を生成しました。",
		});

		expect(screen.getByTestId("solution-display")).toHaveTextContent(
			"a^2 + b^2 = c^2 より c = 5",
		);
		expect(
			screen.getByRole("link", { name: "問題詳細を見る" }),
		).toHaveAttribute("href", "/problems/10");
	});

	it("uploads image when image tab is active with a selected file", async () => {
		const user = userEvent.setup();
		vi.mocked(tagsApi.getTags).mockResolvedValue([]);
		vi.mocked(uploadApi.uploadImage).mockResolvedValue({
			url: "https://blob.vercel-storage.com/math-123.png",
		});
		vi.mocked(problemsApi.createProblem).mockResolvedValue({
			id: 20,
			title: "画像問題",
			content: "画像から問題を解析",
			content_type: "image",
			image_url: "https://blob.vercel-storage.com/math-123.png",
			tags: [],
			created_at: "2026-01-01",
			updated_at: "2026-01-01",
		});
		vi.mocked(problemsApi.generateAnswer).mockResolvedValue({
			id: 20,
			title: "画像問題",
			content: "画像から問題を解析",
			content_type: "image",
			answer: "画像解説",
			tags: [],
			created_at: "2026-01-01",
			updated_at: "2026-01-01",
		});
		vi.mocked(problemsApi.getProblem).mockResolvedValue({
			id: 20,
			title: "画像問題",
			content: "画像から問題を解析",
			content_type: "image",
			answer: "画像解説",
			tags: [],
			created_at: "2026-01-01",
			updated_at: "2026-01-01",
		});

		render(<UploadForm />);

		await user.type(screen.getByLabelText("問題のタイトル"), "画像問題");
		await user.click(screen.getByText("Select File"));

		const submitButton = screen.getByRole("button", { name: "問題を保存" });
		await user.click(submitButton);

		await waitFor(() => {
			expect(uploadApi.uploadImage).toHaveBeenCalled();
			expect(problemsApi.createProblem).toHaveBeenCalledWith({
				title: "画像問題",
				content: "画像から問題を解析",
				content_type: "image",
				image_url: "https://blob.vercel-storage.com/math-123.png",
				tag_ids: [],
			});
		});
	});

	it("displays error toast on ApiError", async () => {
		const user = userEvent.setup();
		vi.mocked(tagsApi.getTags).mockRejectedValue(
			new ApiError("Rate limit", "RATE_LIMIT_EXCEEDED", 429),
		);

		render(<UploadForm />);

		await user.type(screen.getByLabelText("問題のタイトル"), "エラーテスト");
		const submitButton = screen.getByRole("button", { name: "問題を保存" });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith({
				title: "エラーが発生しました",
				description:
					"AIサービスのレート制限に達しました。時間をおいて再試行してください。",
				variant: "destructive",
			});
		});
	});

	it("displays generic error toast on unexpected exception", async () => {
		const user = userEvent.setup();
		vi.mocked(tagsApi.getTags).mockRejectedValue(new Error("Unexpected error"));

		render(<UploadForm />);

		await user.type(screen.getByLabelText("問題のタイトル"), "エラーテスト");
		const submitButton = screen.getByRole("button", { name: "問題を保存" });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockToast).toHaveBeenCalledWith({
				title: "エラーが発生しました",
				description: "問題の保存に失敗しました。もう一度お試しください。",
				variant: "destructive",
			});
		});
	});
});
