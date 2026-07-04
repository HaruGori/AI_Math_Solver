# Issue #27: 画像アップロード時における問題の重複登録および画像URL未定義バグ

## 概要
画像アップロード機能を利用して問題を保存する際、データベースに同一の問題が2件重複して登録され、さらに画像データが正しく紐づかない重大なバグが発生しています。

---

## 検出理由（バグがわかった理由）
フロントエンドとバックエンドのソースコードをレビューし、データフローを追跡した結果、以下の不整合が発見されました。

1. **二重の新規登録リクエスト**: 
   フロントエンドの [upload-form.tsx](file:///Users/opm008090/study/personal_development/AI_Math_Solver/frontend/components/upload-form.tsx) 内の `handleSubmit` では、画像が選択されている場合に `uploadApi.uploadImage` を呼び出します。しかし、バックエンドの `/api/upload` エンドポイントは、単に画像を保存するだけでなく、バックエンド側で直接 `models.Problem` レコードを作成して保存する仕様になっています。これにより、1回目の登録が行われます。
   その後、フロントエンドは続けて `problemsApi.createProblem` を呼び出しているため、データベースに2回目の登録（画像なしのプレーンテキストの問題）が行われます。

2. **APIレスポンスのスキーマ不一致**: 
   フロントエンドの [api.ts](file:///Users/opm008090/study/personal_development/AI_Math_Solver/frontend/lib/api.ts) にある `uploadImage` 関数は、バックエンドから `{ url: string; filename: string }` が返されることを想定して実装されています。
   しかし、実際のバックエンドの `/api/upload` （[upload.py](file:///Users/opm008090/study/personal_development/AI_Math_Solver/backend/routers/upload.py)）は、登録した問題レコードのオブジェクト `{"message": "...", "problem_id": db_problem.id, ...}` を返しており、`url` というキーは存在しません。
   そのため、フロントエンド側で `imageUrl = uploadResult.url` を参照した際、値は `undefined` になり、2回目の問題作成リクエスト（`problemsApi.createProblem`）で `image_url` に `undefined` が送信され、画像が保存されない問題が発生します。

---

## 原因の箇所

### 1. フロントエンド：送信フォームのハンドリング
- **ファイル名**: [upload-form.tsx](file:///Users/opm008090/study/personal_development/AI_Math_Solver/frontend/components/upload-form.tsx#L40-L74)
- **原因コード**:
  ```typescript
  // 1回目の問題登録（画像アップロードAPI呼び出し）
  if (activeTab === "image" && image) {
    const uploadResult = await uploadApi.uploadImage(image)
    imageUrl = uploadResult.url // ※uploadResultにはurlが存在しないためundefinedになる
    content = description || "画像から問題を解析"
  }

  // ... (タグ作成処理) ...

  // 2回目の問題登録（問題作成API呼び出し）
  const problem = await problemsApi.createProblem({
    title,
    content,
    content_type: activeTab,
    image_url: imageUrl, // ※undefinedが渡される
    tag_ids: tagIds,
  })
  ```

### 2. フロントエンド：APIクライアントの型定義
- **ファイル名**: [api.ts](file:///Users/opm008090/study/personal_development/AI_Math_Solver/frontend/lib/api.ts#L134-L145)
- **原因コード**:
  ```typescript
  // レスポンスの型定義が実際のAPIの返り値と異なっている
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    })
    if (!response.ok) throw new Error("Failed to upload image")
    return response.json() // 実際は { message, problem_id, title, answer } などが返る
  }
  ```

### 3. バックエンド：アップロードAPIの実装
- **ファイル名**: [upload.py](file:///Users/opm008090/study/personal_development/AI_Math_Solver/backend/routers/upload.py#L18-L84)
- **原因コード**:
  ```python
  @router.post("/upload")
  def upload_problem(...):
      # ... 画像ファイルを保存 ...
      
      # ※ここで直接データベースにProblemレコードを作成して保存している
      db_problem = models.Problem(
          title=title,
          content=content,
          content_type="image" if file else "text",
          image_url=image_url_str,
          answer=ai_answer
      )
      db.add(db_problem)
      db.commit()
      
      # ※urlキーを含まないレスポンスを返している
      return {
          "message": "Problem uploaded successfully",
          "problem_id": db_problem.id,
          "title": db_problem.title,
          "answer": db_problem.answer
      }
  ```
