import logging
from openai import OpenAI, APIError, APIConnectionError, RateLimitError, InternalServerError, APITimeoutError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from backend.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
    timeout=settings.ai_timeout,
)

class AIGenerationError(Exception):
    def __init__(self, message: str, code: str = "AI_GENERATION_FAILED", retry_after: int | None = None):
        self.message = message
        self.code = code
        self.retry_after = retry_after
        super().__init__(self.message)

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((RateLimitError, APIConnectionError, APITimeoutError, InternalServerError)),
    reraise=True,
)
def _call_openai_with_retry(messages: list[dict]) -> str:
    completion = client.chat.completions.create(
        model=settings.openrouter_ai_model,
        messages=messages,
    )
    answer = completion.choices[0].message.content
    return answer.strip() if answer else ""


def generate_answer(problem_text: str) -> str:
    if not problem_text:
        return ""

    messages = [
        {
            "role": "system",
            "content": (
                "あなたは数学のプロフェッショナルです。以下のルールに従って解説を生成してください。\n\n"
                "1. 問題を分析し、必要な定義や公式を明示してから解き始めてください。\n"
                "2. 解答はステップバイステップで、途中式も省略せずに書いてください。\n"
                "3. 数式や変数は LaTeX 記法（$...$ または $$...$$）で記述してください。\n"
                "4. 最終的な答えは「答え:」の後に明確に示してください。\n"
                "5. 解説は日本語で書いてください。\n"
                "6. 図やグラフが必要な場合は、テキストで簡潔に説明する代替手段を提供してください。\n"
                "7. 証明問題の場合は、前提条件と結論を明確に区別してください。\n"
                "8. 複数の解法が存在する場合は、最も一般的な解法を優先してください。"
            ),
        },
        {"role": "user", "content": problem_text},
    ]

    try:
        answer = _call_openai_with_retry(messages)
        return answer
    except RateLimitError as e:
        logger.warning("AI rate limit exceeded: %s", e)
        raise AIGenerationError(
            message="AIサービスのレート制限に達しました。時間をおいて再試行してください。",
            code="RATE_LIMIT_EXCEEDED",
            retry_after=60,
        )
    except (APIConnectionError, APITimeoutError) as e:
        logger.error("AI service connection/timeout error: %s", e)
        raise AIGenerationError(
            message="AIサービスに接続できませんでした。ネットワークを確認してください。",
            code="AI_SERVICE_UNAVAILABLE",
        )
    except InternalServerError as e:
        logger.error("AI service internal error: %s", e)
        raise AIGenerationError(
            message="AIサービスでエラーが発生しました。時間をおいて再試行してください。",
            code="AI_SERVICE_ERROR",
            retry_after=30,
        )
    except APIError as e:
        logger.error("AI API error: %s", e)
        raise AIGenerationError(
            message="AIサービスの呼び出しに失敗しました。",
            code="AI_API_ERROR",
        )
