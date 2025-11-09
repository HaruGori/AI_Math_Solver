# AI Math Solver

## 概要

AI Math Solverは、ユーザーが数学の問題を解決・管理するためのアプリケーションです。写真やテキストで問題をアップロードし、詳細な解説を受け取り、タグを使って問題を整理できます。

## プロジェクト構造

このプロジェクトは、フロントエンドとバックエンドの両方を含むモノレポとして構成されています。

*   **`frontend/`**: Next.js (React) を使用したユーザーインターフェース。
*   **`backend/`**: Python (FastAPI) を使用したAPIサービス。

## 詳細なプロジェクト情報

# AI Math Solver Project Overview

This document provides an overview of the AI Math Solver project, detailing its purpose, technology stack, development guidelines, and coding conventions.

## Project Purpose

The AI Math Solver is an application designed to help users solve and manage mathematical problems. Users can upload problems via photos or text, receive detailed explanations, and organize their problems using tags for easy retrieval.

## Architecture and Technology Stack

This project is structured as a monorepo containing both a frontend and a backend application.

### Backend

- **Language:** Python  
- **Framework:** FastAPI  
- **Dependency Management:** `uv`  
- **Database ORM:** Prisma (used with Neon)  
- **AI Services:** Integrated AI services for problem-solving (see `backend/services/ai_service.py`)  

### Frontend

- **Framework:** Next.js  
- **Library:** React  
- **Styling:** TailwindCSS  
- **Authentication:** Auth.js  
- **Linting & Formatting:** Biome  

### Shared/External Services

- **Database:** Neon (PostgreSQL compatible)  
- **Image Storage:** Vercel Blob  
- **Deployment:**  
  - Frontend: Vercel  
  - Backend: Railway  

## Building and Running

### Backend Setup and Execution

1. **Install `uv`:**  
   If you don't have `uv` installed, you can install it via pip:
   ```bash
   pip install uv
   ```

2. **Navigate to the backend directory:**
   ```bash
   cd backend/
   ```

3. **Install dependencies:**  
   This will create a virtual environment and install all required packages.
   ```bash
   uv sync
   ```

4. **Activate the virtual environment:**
   ```bash
   source .venv/bin/activate
   ```

5. **Run the development server:**
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```
   The backend server will be accessible at `http://127.0.0.1:8000`.

### Frontend Setup and Execution

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend/
   ```

2. **Install dependencies:**  
   This project uses `pnpm`.
   ```bash
   pnpm install
   ```

3. **Run the development server:**
   ```bash
   pnpm dev
   ```
   The frontend development server will typically run on `http://localhost:3000`.

## Development Conventions

### Linting and Formatting (Frontend)

The frontend uses [Biome](https://biomejs.dev/) for linting and formatting.

- **Lint:**
  ```bash
  pnpm run lint
  ```
- **Format:**
  ```bash
  pnpm run format
  ```
- **Lint and Format (combined):**
  ```bash
  pnpm run biome
  ```

### Pre-commit Hooks

The project utilizes `.husky` for managing Git pre-commit hooks, ensuring code quality and consistency before commits are made.

## Coding Guidelines

### General Rules (Frontend & Backend)

- **Naming Conventions:**
  - Use `snake_case` for Python variables and functions.
  - Use `camelCase` for JavaScript/TypeScript variables and functions.
  - Use `PascalCase` for component and class names.
- **Comments:**
  - Write comments in Japanese where appropriate and helpful.
  - Keep comments concise and relevant to the logic.
- **File Structure:**
  - Organize files by feature or domain.
  - Place shared utilities in `utils` or `lib` directories.

### Backend (FastAPI)

- Use type annotations for all functions.
- Prefer asynchronous functions (`async def`) for I/O operations.
- Handle errors explicitly using `HTTPException`.
- Centralize AI-related logic in `services/ai_service.py`.

### Frontend (Next.js)

- Use TypeScript and define types for all components and functions.
- Use `useState`, `useReducer`, or `useContext` appropriately for state management.
- Centralize API calls in `lib/api.ts` and use SWR or similar for caching.
- Use TailwindCSS utility classes with readability in mind.

### Git Workflow

- **Branch Naming:** Use prefixes like `feature/`, `fix/`, `chore/`, etc.
- **Commit Messages:** Follow Conventional Commits (e.g., `feat: add image upload feature`)
- **Pull Requests:** A tool for automatic review on PR creation is under consideration.

## Language and Output

- **Output Language:** All user-facing outputs should be in Japanese.
- **Comment Language:** Comments in code should be written in Japanese where appropriate and helpful.


## Commit Message Guidelines

To ensure clarity and consistency in version control, this project follows a structured commit message format using [Gitmoji](https://gitmoji.dev/). All commit messages must follow the pattern:

```
((gitmoji) message (#issue_number))
```

### Format Details

- **gitmoji**: Select an appropriate emoji from [gitmoji.dev](https://gitmoji.dev/) that best represents the type of change.
- **message**: Write a short, descriptive message in Japanese.
- **issue_number**: Use the number from the related issue branch (e.g., `issue/5` → `#5`).

### Example

If you are working on branch `issue/5` and added a new feature, your commit message should be:

```
✨ 機能を追加 (#5)
```

---

### Common Gitmoji Usage

| Emoji | Code | Meaning | Example |
|-------|------|---------|---------|
| ✨ | `:sparkles:` | New feature | ✨ タグ機能を追加 (#12) |
| 🐛 | `:bug:` | Bug fix | 🐛 数式表示のバグを修正 (#8) |
| ♻️ | `:recycle:` | Refactoring | ♻️ AIサービスの構造をリファクタリング (#15) |
| 📝 | `:memo:` | Documentation | 📝 READMEを更新 (#3) |
| 🚀 | `:rocket:` | Deployment-related changes | 🚀 Railway設定を更新 (#20) |
| ✅ | `:white_check_mark:` | Adding tests | ✅ 数式解析のテストを追加 (#7) |
| 🔧 | `:wrench:` | Configuration changes | 🔧 Biome設定を調整 (#9) |
| 🔥 | `:fire:` | Removing code or files | 🔥 不要なコンポーネントを削除 (#11) |
| 💄 | `:lipstick:` | UI updates | 💄 ボタンのスタイルを調整 (#6) |
| 🎨 | `:art:` | Code style improvements | 🎨 インデントと空白を修正 (#4) |
| ⬆️ | `:arrow_up:` | Dependency upgrade | ⬆️ Prismaを最新バージョンに更新 (#13) |
| ⬇️ | `:arrow_down:` | Dependency downgrade | ⬇️ FastAPIのバージョンを戻した (#14) |
| 🐳 | `:whale:` | Docker-related changes | 🐳 Dockerfileを追加 (#18) |
| 🧪 | `:test_tube:` | Experimental code | 🧪 数式分類の試験的ロジックを追加 (#21) |
| 🚨 | `:rotating_light:` | Fixing linter errors | 🚨 Biomeの警告を修正 (#10) |
| 📦 | `:package:` | Package-related changes | 📦 新しいライブラリを追加 (#16) |
| 🔒 | `:lock:` | Security fixes | 🔒 認証処理の脆弱性を修正 (#19) |
| 🗃️ | `:card_file_box:` | DB schema changes | 🗃️ Prismaスキーマを更新 (#22) |
| 🧹 | `:broom:` | Code cleanup | 🧹 未使用コードを削除 (#23) |
| 🕹️ | `:joystick:` | Feature toggle | 🕹️ 数式解析機能のトグルを追加 (#24) |

### Notes

- Commit messages should be written in **Japanese**.
- Use **present tense** and keep messages concise.
- If multiple changes are made, choose the most representative gitmoji.
- For ambiguous cases, refer to [gitmoji.dev](https://gitmoji.dev/) for guidance.

## ライセンス

[LICENSE](LICENSE)