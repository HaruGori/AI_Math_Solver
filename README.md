# AI Math Solver

## 概要

AI Math Solverは、ユーザーが数学の問題を解決・管理するためのアプリケーションです。写真やテキストで問題をアップロードし、詳細な解説を受け取り、タグを使って問題を整理できます。

## プロジェクト構造

このプロジェクトは、フロントエンドとバックエンドの両方を含むモノレポとして構成されています。

*   **`frontend/`**: Next.js (React) を使用したユーザーインターフェース。
*   **`backend/`**: Python (FastAPI) を使用したAPIサービス。

## 詳細なプロジェクト情報

### AI Math Solver プロジェクト概要

このドキュメントは、AI Math Solverプロジェクトの概要を提供し、その目的、技術スタック、開発ガイドライン、およびコーディング規約を詳述します。

### プロジェクトの目的

AI Math Solverは、ユーザーが数学の問題を解決し、管理するのを助けるために設計されたアプリケーションです。ユーザーは写真やテキストで問題をアップロードし、詳細な説明を受け取り、タグを使用して問題を簡単に検索できるように整理できます。

### アーキテクチャと技術スタック

このプロジェクトは、フロントエンドとバックエンドの両方のアプリケーションを含むモノレポとして構成されています。

#### バックエンド

-   **言語:** Python
-   **フレームワーク:** FastAPI
-   **依存関係管理:** `uv`
-   **データベース ORM:** SQLAlchemy (Neonと連携)
-   **AIサービス:** 問題解決のための統合AIサービス (`backend/services/ai_service.py`を参照)

#### フロントエンド

-   **フレームワーク:** Next.js
-   **ライブラリ:** React
-   **スタイリング:** TailwindCSS
-   **認証:** Auth.js
-   **リンティング & フォーマット:** Biome

#### 共有/外部サービス

-   **データベース:** Neon (PostgreSQL互換)
-   **画像ストレージ:** Vercel Blob
-   **デプロイ:**
    -   フロントエンド: Vercel
    -   バックエンド: Railway

### ビルドと実行

#### バックエンドのセットアップと実行

1.  **`uv`のインストール:**
    `uv`がインストールされていない場合、pip経由でインストールできます。
    ```bash
    pip install uv
    ```

2.  **バックエンドディレクトリへ移動:**
    ```bash
    cd backend/
    ```

3.  **依存関係のインストール:**
    これにより、仮想環境が作成され、必要なすべてのパッケージがインストールされます。
    ```bash
    uv sync
    ```

4.  **仮想環境のアクティブ化:**
    ```bash
    source .venv/bin/activate
    ```
5. **ディレクトリを戻す**
    ```bash
    cd ../
    ```

6.  **開発サーバーの実行:**
    ```bash
    uvicorn backend.main:app --reload --port 8000
    ```
    バックエンドサーバーは `http://127.0.0.1:8000` でアクセス可能になります。

#### フロントエンドのセットアップと実行

1.  **フロントエンドディレクトリへ移動:**
    ```bash
    cd frontend/
    ```

2.  **依存関係のインストール:**
    このプロジェクトでは `pnpm` を使用します。
    ```bash
    pnpm install
    ```

3.  **開発サーバーの実行:**
    ```bash
    pnpm dev
    ```
    フロントエンド開発サーバーは通常 `http://localhost:3001` で実行されます。

### Docker を使用したセットアップと実行

Docker Compose を使用すると、バックエンド・フロントエンド・PostgreSQL を一括で起動できます。

1.  **環境変数の設定:**
    `.env.example` を `.env` にコピーし、必要な値を設定します。
    ```bash
    cp .env.example .env
    ```

2.  **本番用ビルドの起動:**
    ```bash
    docker compose up -d
    ```
    - バックエンド: `http://localhost:8001`
    - フロントエンド: `http://localhost:3000`
    - PostgreSQL: backendコンテナからの内部通信のみ（ホスト非公開）

3.  **開発用（ホットリロード）の起動:**
    ```bash
    docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    ```
    コード変更が自動反映されます。

4.  **コンテナの停止:**
    ```bash
    docker compose down -v
    ```

### 環境変数

プロジェクトはルート、バックエンド、フロントエンドの3箇所で環境変数を管理します。

#### ルート `.env`（Docker Compose用）

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `POSTGRES_PASSWORD` | 任意（既定値: `password`） | PostgreSQLのパスワード |
| `OPENROUTER_API_KEY` | 必須 | OpenRouterのAPIキー（AI問題解決に使用） |
| `OPENROUTER_AI_MODEL` | 任意（既定値: `minimax/minimax-m2:free`） | 使用するAIモデル |
| `NEXTAUTH_SECRET` | 必須 | NextAuthの暗号化キー（`openssl rand -base64 32` で生成） |
| `NEXTAUTH_URL` | 任意（既定値: `http://localhost:3000`） | 認証コールバックURL |

#### バックエンド `backend/.env.local`

`backend/.env.example` をコピーして作成します。

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `DATABASE_URL` | 必須 | Neon（PostgreSQL）の接続文字列 |
| `OPENROUTER_API_KEY` | 必須 | OpenRouter APIキー |
| `OPENROUTER_AI_MODEL` | 任意 | AIモデル指定 |
| `AI_MAX_RETRIES` | 任意（既定値: 3） | AIリクエスト最大リトライ回数 |
| `AI_RETRY_BASE_DELAY` | 任意（既定値: 1.0） | リトライ基本待機時間（秒） |
| `AI_RETRY_MAX_DELAY` | 任意（既定値: 10.0） | リトライ最大待機時間（秒） |
| `AI_TIMEOUT` | 任意（既定値: 30.0） | AIリクエストタイムアウト（秒） |

#### フロントエンド `frontend/.env.local`

`frontend/.env.example` をコピーして作成します。

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `NEXTAUTH_URL` | 必須 | 認証コールバックURL |
| `NEXTAUTH_SECRET` | 必須 | NextAuthシークレットキー |
| `NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN` | 必須 | Vercel Blobトークン（画像アップロード用） |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google認証を使用する場合 | Google OAuth認証情報 |
| `NEXT_PUBLIC_API_TIMEOUT` | 任意（既定値: 30000） | APIリクエストタイムアウト（ms） |
| `NEXT_PUBLIC_MAX_RETRIES` | 任意（既定値: 3） | APIリトライ回数 |

### 開発規約

#### リンティングとフォーマット (フロントエンド)

フロントエンドはリンティングとフォーマットに [Biome](https://biomejs.dev/) を使用します。

-   **リント:**
    ```bash
    pnpm run lint
    ```
-   **フォーマット:**
    ```bash
    pnpm run format
    ```
-   **リントとフォーマット (結合):**
    ```bash
    pnpm run biome
    ```

#### プリコミットフック

プロジェクトはGitのプリコミットフックを管理するために `.husky` を利用し、コミットが行われる前にコードの品質と一貫性を保証します。

### コーディングガイドライン

#### 一般的なルール (フロントエンド & バックエンド)

-   **命名規則:**
    -   Pythonの変数と関数には `snake_case` を使用します。
    -   JavaScript/TypeScriptの変数と関数には `camelCase` を使用します。
    -   コンポーネント名とクラス名には `PascalCase` を使用します。
-   **コメント:**
    -   適切で役立つ場合は日本語でコメントを記述します。
    -   コメントは簡潔でロジックに関連するものに保ちます。
-   **ファイル構造:**
    -   機能またはドメインごとにファイルを整理します。
    -   共有ユーティリティは `utils` または `lib` ディレクトリに配置します。

#### バックエンド (FastAPI)

-   すべての関数に型アノテーションを使用します。
-   I/O操作には非同期関数 (`async def`) を優先します。
-   `HTTPException` を使用してエラーを明示的に処理します。
-   AI関連のロジックは `services/ai_service.py` に集約します。

#### フロントエンド (Next.js)

-   すべてのコンポーネントと関数にTypeScriptを使用し、型を定義します。
-   状態管理には `useState`、`useReducer`、または `useContext` を適切に使用します。
-   API呼び出しは `lib/api.ts` に集約し、キャッシュにはSWRなどを利用します。
-   TailwindCSSユーティリティクラスは可読性を考慮して使用します。


### コミットメッセージガイドライン

バージョン管理の明確さと一貫性を確保するため、このプロジェクトは [Gitmoji](https://gitmoji.dev/) を使用した構造化されたコミットメッセージ形式に従います。すべてのコミットメッセージは以下のパターンに従う必要があります。

```
((gitmoji) message (#issue_number))
```

#### 形式の詳細

-   **gitmoji**: 変更の種類を最もよく表す [gitmoji.dev](https://gitmoji.dev/) から適切な絵文字を選択します。
-   **message**: 短く、説明的なメッセージを日本語で記述します。
-   **issue_number**: 関連するissueブランチの番号を使用します (例: `issue/5` → `#5`)。

#### 例

`issue/5`ブランチで作業しており、新しい機能を追加した場合、コミットメッセージは次のようになります。

```
✨ 機能を追加 (#5)
```

---

#### 一般的なGitmojiの使用法

| Emoji | Code | Meaning | Example |
|-------|------|---------|---------|
| ✨ | `:sparkles:` | 新機能 | ✨ タグ機能を追加 (#12) |
| 🐛 | `:bug:` | バグ修正 | 🐛 数式表示のバグを修正 (#8) |
| ♻️ | `:recycle:` | リファクタリング | ♻️ AIサービスの構造をリファクタリング (#15) |
| 📝 | `:memo:` | ドキュメンテーション | 📝 READMEを更新 (#3) |
| 🚀 | `:rocket:` | デプロイ関連の変更 | 🚀 Railway設定を更新 (#20) |
| ✅ | `:white_check_mark:` | テストの追加 | ✅ 数式解析のテストを追加 (#7) |
| 🔧 | `:wrench:` | 設定変更 | 🔧 Biome設定を調整 (#9) |
| 🔥 | `:fire:` | コードまたはファイルの削除 | 🔥 不要なコンポーネントを削除 (#11) |
| 💄 | `:lipstick:` | UI更新 | 💄 ボタンのスタイルを調整 (#6) |
| 🎨 | `:art:` | コードスタイルの改善 | 🎨 インデントと空白を修正 (#4) |
| ⬆️ | `:arrow_up:` | 依存関係のアップグレード | ⬆️ Prismaを最新バージョンに更新 (#13) |
| ⬇️ | `:arrow_down:` | 依存関係のダウングレード | ⬇️ FastAPIのバージョンを戻した (#14) |
| 🐳 | `:whale:` | Docker関連の変更 | 🐳 Dockerfileを追加 (#18) |
| 🧪 | `:test_tube:` | 実験的なコード | 🧪 数式分類の試験的ロジックを追加 (#21) |
| 🚨 | `:rotating_light:` | リンターエラーの修正 | 🚨 Biomeの警告を修正 (#10) |
| 📦 | `:package:` | パッケージ関連の変更 | 📦 新しいライブラリを追加 (#16) |
| 🔒 | `:lock:` | セキュリティ修正 | 🔒 認証処理の脆弱性を修正 (#19) |
| 🗃️ | `:card_file_box:` | DBスキーマ変更 | 🗃️ Prismaスキーマを更新 (#22) |
| 🧹 | `:broom:` | コードクリーンアップ | 🧹 未使用コードを削除 (#23) |
| 🕹️ | `:joystick:` | 機能トグル | 🕹️ 数式解析機能のトグルを追加 (#24) |

### 注意事項

-   コミットメッセージは**日本語**で記述してください。
-   **現在形**を使用し、メッセージは簡潔に保ってください。
-   複数の変更が行われた場合は、最も代表的なgitmojiを選択してください。
-   曖昧な場合は、[gitmoji.dev](https://gitmoji.dev/) を参照してください。

## ライセンス

[LICENSE](LICENSE)