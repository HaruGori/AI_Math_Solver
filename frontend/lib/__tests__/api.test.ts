import { describe, expect, it, vi } from "vitest";

const RETRY_TIMEOUT = 25000;

import {
	ApiError,
	type CreateProblemData,
	problemsApi,
	tagsApi,
	type UpdateProblemData,
	uploadApi,
} from "@/lib/api";

function mockFetch(status: number, body: unknown, ok?: boolean) {
	return vi.fn().mockResolvedValue({
		ok: ok ?? (status >= 200 && status < 300),
		status,
		json: () => Promise.resolve(body),
	});
}

describe("ApiError", () => {
	it("creates error with status and code", () => {
		const err = new ApiError(404, "NOT_FOUND", "not found");
		expect(err.status).toBe(404);
		expect(err.code).toBe("NOT_FOUND");
		expect(err.message).toBe("not found");
		expect(err.retryAfter).toBeNull();
	});

	it("stores retryAfter", () => {
		const err = new ApiError(429, "RATE_LIMIT", "too many", 60);
		expect(err.retryAfter).toBe(60);
	});
});

describe("problemsApi", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("getProblems", async () => {
		vi.stubGlobal("fetch", mockFetch(200, { problems: [], total: 0 }));
		const result = await problemsApi.getProblems({
			skip: 0,
			limit: 10,
			tag: "代数",
			search: "二次方程式",
		});
		expect(result).toEqual({ problems: [], total: 0 });
	});

	it("getProblem", async () => {
		vi.stubGlobal("fetch", mockFetch(200, { id: 1, title: "test" }));
		const result = await problemsApi.getProblem(1);
		expect(result).toMatchObject({ id: 1, title: "test" });
	});

	it("createProblem", async () => {
		vi.stubGlobal("fetch", mockFetch(201, { id: 1 }));
		const data: CreateProblemData = {
			title: "test",
			content: "x = 1",
			content_type: "text",
			tag_ids: [],
		};
		const result = await problemsApi.createProblem(data);
		expect(result).toMatchObject({ id: 1 });
	});

	it("updateProblem", async () => {
		vi.stubGlobal("fetch", mockFetch(200, { id: 1 }));
		const data: UpdateProblemData = { answer: "x = 2" };
		const result = await problemsApi.updateProblem(1, data);
		expect(result).toMatchObject({ id: 1 });
	});

	it("deleteProblem", async () => {
		const mock = mockFetch(204, null, true);
		vi.stubGlobal("fetch", mock);
		await problemsApi.deleteProblem(1);
		expect(mock).toHaveBeenCalled();
	});

	it("generateAnswer", async () => {
		vi.stubGlobal("fetch", mockFetch(200, { answer: "x = 2" }));
		const result = await problemsApi.generateAnswer(1);
		expect(result).toEqual({ answer: "x = 2" });
	});
});

describe("tagsApi", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("getTags returns tag list", async () => {
		vi.stubGlobal("fetch", mockFetch(200, [{ id: 1, name: "代数" }]));
		const tags = await tagsApi.getTags();
		expect(tags).toHaveLength(1);
		expect(tags[0].name).toBe("代数");
	});

	it("createTag sends POST", async () => {
		vi.stubGlobal("fetch", mockFetch(201, { id: 1, name: "代数" }));
		const tag = await tagsApi.createTag("代数");
		expect(tag.name).toBe("代数");
	});

	it("updateTag sends PUT", async () => {
		vi.stubGlobal("fetch", mockFetch(200, { id: 1, name: "幾何" }));
		const tag = await tagsApi.updateTag(1, "幾何");
		expect(tag.name).toBe("幾何");
	});

	it("deleteTag sends DELETE", async () => {
		const mock = mockFetch(204, null, true);
		vi.stubGlobal("fetch", mock);
		await tagsApi.deleteTag(1);
		expect(mock).toHaveBeenCalled();
	});
});

describe("uploadApi", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("uploadImage sends POST with FormData", async () => {
		vi.stubGlobal(
			"fetch",
			mockFetch(200, { url: "/img.png", filename: "img.png" }),
		);
		const file = new File(["dummy"], "test.png", { type: "image/png" });
		const result = await uploadApi.uploadImage(file);
		expect(result.url).toBe("/img.png");
		expect(result.filename).toBe("img.png");
	});
});

describe("retry logic", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("retries GET on 429", async () => {
		const fetch429 = vi
			.fn()
			.mockResolvedValueOnce({
				ok: false,
				status: 429,
				json: () => Promise.resolve({}),
			})
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve([]),
			});
		vi.stubGlobal("fetch", fetch429);
		const result = await problemsApi.getProblem(1);
		expect(fetch429).toHaveBeenCalledTimes(2);
	});

	it("does NOT retry POST on 429", async () => {
		const fetch429 = vi.fn().mockResolvedValue({
			ok: false,
			status: 429,
			json: () => Promise.resolve({ error: "RATE_LIMIT", message: "too many" }),
		});
		vi.stubGlobal("fetch", fetch429);
		await expect(tagsApi.createTag("test")).rejects.toThrow(ApiError);
		expect(fetch429).toHaveBeenCalledTimes(1);
	});

	it("retries GET on 503", async () => {
		const fetch503 = vi
			.fn()
			.mockResolvedValueOnce({
				ok: false,
				status: 503,
				json: () => Promise.resolve({}),
			})
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ id: 1 }),
			});
		vi.stubGlobal("fetch", fetch503);
		const result = await problemsApi.getProblem(1);
		expect(fetch503).toHaveBeenCalledTimes(2);
	});

	it("throws ApiError on 404", async () => {
		vi.stubGlobal(
			"fetch",
			mockFetch(404, { error: "NOT_FOUND", message: "not found" }),
		);
		await expect(problemsApi.getProblem(999)).rejects.toThrow(ApiError);
	});

	it("throws TIMEOUT on abort", async () => {
		const abortFetch = vi.fn().mockImplementation(
			() =>
				new Promise((_, reject) => {
					const error = new DOMException(
						"The operation was aborted",
						"AbortError",
					);
					reject(error);
				}),
		);
		vi.stubGlobal("fetch", abortFetch);
		await expect(problemsApi.getProblem(1)).rejects.toMatchObject({
			code: "TIMEOUT",
		});
	});

	it(
		"throws NETWORK_ERROR on fetch failure",
		async () => {
			const networkFetch = vi
				.fn()
				.mockRejectedValue(new TypeError("Failed to fetch"));
			vi.stubGlobal("fetch", networkFetch);
			await expect(problemsApi.getProblem(1)).rejects.toMatchObject({
				code: "NETWORK_ERROR",
			});
		},
		RETRY_TIMEOUT,
	);
});
