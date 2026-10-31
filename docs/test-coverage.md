# テストカバレッジ

## 概要

CIでbackend（pytest-cov）とfrontend（Vitest / V8）のカバレッジを計測し、GitHub Actionsのjob summaryに表示します。カバレッジが基準値を下回るとCIが失敗します。

## 対象範囲

### backend

- 対象: `backend/` 配下
- 除外: `backend/tests/`, `backend/alembic/`, `backend/.venv/`
- 指標: 行・分岐（`--cov-branch`）
- 設定: `backend/pyproject.toml` の `[tool.coverage.run]` / `[tool.coverage.report]`

### frontend

- 対象: `frontend/app/`, `frontend/components/`, `frontend/hooks/`, `frontend/lib/`
- 除外: テストファイル、`__tests__/`、型定義ファイル
- 指標: statements / branches / functions / lines
- 設定: `frontend/vitest.config.ts` の `test.coverage`

`components/ui/` のshadcn/uiコンポーネントも対象です。未テストのUIプリミティブが多いため、初回基準値は低めです。

## 基準値

- 計測日: 2026-10-31
- 計測時のmain: `d1816f0`
- 計測環境: Python 3.11.18 / Node.js 26.12.1 / Vitest 4.1.10
- CI環境: Python 3.11 / Node.js 20

### backend

| 指標 | 値 |
| --- | ---: |
| Statements | 345 |
| Missed | 18 |
| Branches | 42 |
| Partial branches | 2 |
| Total coverage | 94.3% |
| Threshold (`fail_under`) | 94% |

### frontend

| 指標 | 基準値 | Threshold |
| --- | ---: | ---: |
| Statements | 25.55% (288/1127) | 25% |
| Branches | 24.22% (149/615) | 24% |
| Functions | 23.46% (107/456) | 23% |
| Lines | 25.25% (272/1077) | 25% |

Thresholdは基準値の整数切り捨てです。基準値を下回らないための下限として運用します。

## 実行方法

### backend

```bash
cd backend
PYTHONPATH=.. uv run python -m pytest tests/ -v --cov --cov-report=term-missing --cov-report=xml
```

`backend/coverage.xml` が生成されます。

### frontend

```bash
cd frontend
pnpm test:coverage
```

`frontend/coverage/coverage-summary.json` と `frontend/coverage/lcov.info` が生成されます。

## CIでの表示

- backend: `coverage report --format=markdown` の結果をjob summaryへ出力
- frontend: `scripts/coverage-summary.mjs` が `coverage-summary.json` をMarkdownへ変換してjob summaryへ出力
- PRでは「Checks」タブの該当jobからサマリーを確認できます。mainとの差分は自動計算しません
- 詳細レポートはArtifacts（`backend-coverage`, `frontend-coverage`）から取得できます

## 閾値の更新ルール

- 基準値・閾値は原則として下げません
- カバレッジが向上した場合は、基準値と閾値を更新するPRを作成します。更新時は計測日・コミットSHA・実行コマンドをこのドキュメントに記録します
- 新規コード追加でカバレッジが下がる場合は、テスト追加を優先します。やむを得ず閾値や対象範囲を変更する場合は、PRで理由を説明します
- 対象範囲や除外設定を変更した場合は、基準値を再計測して更新します
