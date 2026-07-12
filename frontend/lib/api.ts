const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;
const MAX_RETRIES = Number(process.env.NEXT_PUBLIC_MAX_RETRIES) || 3;

export interface Tag {
	id: number;
	name: string;
}

export interface Problem {
	id: number;
	title: string;
	content: string;
	content_type: "text" | "image";
	image_url?: string;
	answer?: string;
	created_at: string;
	updated_at: string;
	tags: Tag[];
}

export interface ProblemList {
	problems: Problem[];
	total: number;
}

export interface CreateProblemData {
	title: string;
	content: string;
	content_type: "text" | "image";
	image_url?: string;
	tag_ids: number[];
}

export class ApiError extends Error {
	status: number;
	code: string;
	retryAfter: number | null;

	constructor(
		status: number,
		code: string,
		message: string,
		retryAfter: number | null = null,
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.retryAfter = retryAfter;
	}
}

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(method: string, status: number): boolean {
	if (method !== "GET") return false;
	return status === 429 || status >= 500;
}

async function fetchWithRetry(
	url: string,
	options: RequestInit = {},
	timeoutMs: number = DEFAULT_TIMEOUT,
	maxRetries: number = MAX_RETRIES,
): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	const fetchOptions: RequestInit = {
		...options,
		signal: options.signal ? options.signal : controller.signal,
	};

	let lastError: Error | null = null;
	const method = (options.method || "GET").toUpperCase();

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			if (attempt > 0) {
				const delay =
					Math.min(1000 * 2 ** attempt, 10000) + Math.random() * 500;
				await sleep(delay);
			}

			const response = await fetch(url, fetchOptions);
			clearTimeout(timeoutId);

			if (response.ok) return response;

			if (shouldRetry(method, response.status) && attempt < maxRetries) {
				lastError = new ApiError(
					response.status,
					"RETRYING",
					`Retrying after ${response.status}`,
				);
				continue;
			}

			const body = await parseErrorBody(response);
			throw new ApiError(
				response.status,
				body.error || "UNKNOWN_ERROR",
				body.message || `Request failed with status ${response.status}`,
				body.retry_after ?? null,
			);
		} catch (err) {
			clearTimeout(timeoutId);

			if (err instanceof ApiError) throw err;

			if (err instanceof DOMException && err.name === "AbortError") {
				throw new ApiError(
					0,
					"TIMEOUT",
					"リクエストがタイムアウトしました。ネットワークを確認してください。",
				);
			}

			if (err instanceof TypeError && err.message === "Failed to fetch") {
				if (attempt < maxRetries) {
					lastError = new ApiError(
						0,
						"NETWORK_ERROR",
						"Retrying after network error",
					);
					continue;
				}
				throw new ApiError(
					0,
					"NETWORK_ERROR",
					"サーバーに接続できませんでした。ネットワークを確認してください。",
				);
			}

			lastError = err as Error;
			if (attempt >= maxRetries) throw lastError;
		}
	}

	throw lastError || new Error("Unexpected error");
}

async function parseErrorBody(
	response: Response,
): Promise<{ error?: string; message?: string; retry_after?: number }> {
	try {
		return await response.json();
	} catch {
		return {};
	}
}

export const problemsApi = {
	async getProblems(params?: {
		skip?: number;
		limit?: number;
		tag?: string;
		search?: string;
	}): Promise<ProblemList> {
		const queryParams = new URLSearchParams();
		if (params?.skip) queryParams.append("skip", params.skip.toString());
		if (params?.limit) queryParams.append("limit", params.limit.toString());
		if (params?.tag) queryParams.append("tag", params.tag);
		if (params?.search) queryParams.append("search", params.search);

		const response = await fetchWithRetry(
			`${API_URL}/api/problems?${queryParams.toString()}`,
			{ method: "GET" },
		);
		return response.json();
	},

	async getProblem(id: number): Promise<Problem> {
		const response = await fetchWithRetry(`${API_URL}/api/problems/${id}`, {
			method: "GET",
		});
		return response.json();
	},

	async createProblem(data: CreateProblemData): Promise<Problem> {
		const response = await fetchWithRetry(
			`${API_URL}/api/problems`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			},
			DEFAULT_TIMEOUT,
			0,
		);
		return response.json();
	},

	async updateProblem(
		id: number,
		data: Partial<CreateProblemData>,
	): Promise<Problem> {
		const response = await fetchWithRetry(
			`${API_URL}/api/problems/${id}`,
			{
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			},
			DEFAULT_TIMEOUT,
			0,
		);
		return response.json();
	},

	async deleteProblem(id: number): Promise<void> {
		await fetchWithRetry(
			`${API_URL}/api/problems/${id}`,
			{ method: "DELETE" },
			DEFAULT_TIMEOUT,
			0,
		);
	},

	async generateAnswer(id: number): Promise<{ answer: string }> {
		const response = await fetchWithRetry(
			`${API_URL}/api/problems/${id}/solution`,
			{ method: "POST" },
			DEFAULT_TIMEOUT,
			0,
		);
		return response.json();
	},
};

export const tagsApi = {
	async getTags(): Promise<Tag[]> {
		const response = await fetchWithRetry(`${API_URL}/api/tags`, {
			method: "GET",
		});
		return response.json();
	},

	async createTag(name: string): Promise<Tag> {
		const response = await fetchWithRetry(
			`${API_URL}/api/tags`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name }),
			},
			DEFAULT_TIMEOUT,
			0,
		);
		return response.json();
	},

	async deleteTag(id: number): Promise<void> {
		await fetchWithRetry(
			`${API_URL}/api/tags/${id}`,
			{ method: "DELETE" },
			DEFAULT_TIMEOUT,
			0,
		);
	},
};

export const uploadApi = {
	async uploadImage(file: File): Promise<{ url: string; filename: string }> {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetchWithRetry(
			`${API_URL}/api/upload`,
			{
				method: "POST",
				body: formData,
			},
			DEFAULT_TIMEOUT,
			0,
		);
		return response.json();
	},
};
