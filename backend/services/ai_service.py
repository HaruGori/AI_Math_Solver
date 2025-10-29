from openai import OpenAI
from backend.config import get_settings

settings = get_settings()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.openrouter_api_key,
)

def generate_answer(problem_text: str) -> str:
    """
    与えられた問題テキストに対するAIの回答を生成する
    """
    if not problem_text:
        return ""

    try:
        completion = client.chat.completions.create(
            model=settings.openrouter_ai_model,
            messages=[
                {
                    "role": "system",
                    "content": "回答して下さい",
                },
                {
                    "role": "user",
                    "content": problem_text,
                },
            ],
        )
        answer = completion.choices[0].message.content
        return answer.strip() if answer else ""
    except Exception as e:
        print(f"Error generating answer from AI: {e}")
        return "Failed to generate answer."
