// APIクライアント

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface Tag {
  id: number
  name: string
}

export interface Problem {
  id: number
  title: string
  content: string
  content_type: "text" | "image"
  image_url?: string
  answer?: string
  created_at: string
  updated_at: string
  tags: Tag[]
}

export interface ProblemList {
  problems: Problem[]
  total: number
}

export interface CreateProblemData {
  title: string
  content: string
  content_type: "text" | "image"
  image_url?: string
  tag_ids: number[]
}

// 問題API
export const problemsApi = {
  // 問題一覧を取得
  async getProblems(params?: {
    skip?: number
    limit?: number
    tag?: string
    search?: string
  }): Promise<ProblemList> {
    const queryParams = new URLSearchParams()
    if (params?.skip) queryParams.append("skip", params.skip.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.tag) queryParams.append("tag", params.tag)
    if (params?.search) queryParams.append("search", params.search)

    const response = await fetch(`${API_URL}/api/problems?${queryParams.toString()}`)
    if (!response.ok) throw new Error("Failed to fetch problems")
    return response.json()
  },

  // 問題詳細を取得
  async getProblem(id: number): Promise<Problem> {
    const response = await fetch(`${API_URL}/api/problems/${id}`)
    if (!response.ok) throw new Error("Failed to fetch problem")
    return response.json()
  },

  // 問題を作成
  async createProblem(data: CreateProblemData): Promise<Problem> {
    const response = await fetch(`${API_URL}/api/problems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create problem")
    return response.json()
  },

  // 問題を更新
  async updateProblem(id: number, data: Partial<CreateProblemData>): Promise<Problem> {
    const response = await fetch(`${API_URL}/api/problems/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update problem")
    return response.json()
  },

  // 問題を削除
  async deleteProblem(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/problems/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete problem")
  },

  // AI解説を生成
  async generateAnswer(id: number): Promise<{ answer: string }> {
    const response = await fetch(`${API_URL}/api/problems/${id}/solution`, {
      method: "POST",
    })
    if (!response.ok) throw new Error("Failed to generate solution")
    return response.json()
  },
}

// タグAPI
export const tagsApi = {
  // タグ一覧を取得
  async getTags(): Promise<Tag[]> {
    const response = await fetch(`${API_URL}/api/tags`)
    if (!response.ok) throw new Error("Failed to fetch tags")
    return response.json()
  },

  // タグを作成
  async createTag(name: string): Promise<Tag> {
    const response = await fetch(`${API_URL}/api/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) throw new Error("Failed to create tag")
    return response.json()
  },

  // タグを削除
  async deleteTag(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/tags/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete tag")
  },
}

// アップロードAPI
export const uploadApi = {
  // 画像をアップロード
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    })
    if (!response.ok) throw new Error("Failed to upload image")
    return response.json()
  },
}

// OCR API (将来実装)
export const ocrApi = {
  // 画像からテキストを抽出
  async extractText(file: File): Promise<{ text: string; filename: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_URL}/api/ocr`, {
      method: "POST",
      body: formData,
    })
    if (!response.ok) throw new Error("Failed to extract text")
    return response.json()
  },
}
