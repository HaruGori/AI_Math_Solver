# AI数学ソルバー - バックエンド

これは、FastAPIフレームワークを使用してPythonで記述されたAI数学ソルバーアプリケーションのバックエンドです。

## セットアップ

このプロジェクトでは、パッケージと環境の管理に[uv](https://github.com/astral-sh/uv)を使用します。

1. **仮想環境の作成と依存関係のインストール:**
   ```bash
   uv sync
   ```
   このコマンドは、`.venv`という名前の仮想環境を作成（または既存のものを同期）し、`pyproject.toml`にリストされている依存関係をインストールします。

2. **仮想環境のアクティベート:**
   ```bash
   source .venv/bin/activate
   ```

## サーバーの実行

開発サーバーを実行するには：AI_MATH-SOLVERディレクトリで、

```bash
uvicorn backend.main:app --reload --port 8000
```

サーバーは`http://127.0.0.1:8000`で実行されます。