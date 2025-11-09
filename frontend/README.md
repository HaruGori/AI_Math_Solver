# AI Math Solver - フロントエンド

このディレクトリには、AI Math Solverアプリケーションのフロントエンド部分が含まれています。Next.jsとReactで構築されており、ユーザーインターフェースとユーザーエクスペリエンスを提供します。

## 技術スタック

*   **フレームワーク**: Next.js
*   **ライブラリ**: React
*   **スタイリング**: TailwindCSS
*   **認証**: Auth.js
*   **リンティング & フォーマット**: Biome

## セットアップと実行

プロジェクト全体のセットアップ手順については、ルートディレクトリの [GEMINI.md](../GEMINI.md) を参照してください。

フロントエンドを個別にセットアップして実行するには、以下の手順に従ってください。

1.  **依存関係のインストール**:
    ```bash
    pnpm install
    ```
2.  **開発サーバーの起動**:
    ```bash
    pnpm dev
    ```
    開発サーバーは通常 `http://localhost:3001` で実行されます。

## 開発ガイドライン

### リンティングとフォーマット

フロントエンドは [Biome](https://biomejs.dev/) を使用してリンティングとフォーマットを行います。

*   **リント**:
    ```bash
    pnpm run lint
    ```
*   **フォーマット**:
    ```bash
    pnpm run format
    ```
*   **リントとフォーマット (結合)**:
    ```bash
    pnpm run biome
    ```

### 環境変数

`.env.local` ファイルに以下の環境変数を設定する必要があります。詳細については、ルートディレクトリの [GEMINI.md](../GEMINI.md) を参照してください。

*   `AUTH_SECRET`
*   `AUTH_URL`
*   `GOOGLE_CLIENT_ID`
*   `GOOGLE_CLIENT_SECRET`
