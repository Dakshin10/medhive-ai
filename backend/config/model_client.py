from autogen_ext.models.openai import OpenAIChatCompletionClient

from config.settings import (
    GROQ_API_KEY,
    MODEL_NAME,
)

model_client = OpenAIChatCompletionClient(
    model=MODEL_NAME,
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",

    model_info={
        "vision": False,
        "function_calling": True,
        "json_output": True,
        "family": "unknown",
        "structured_output": True,
    },
)