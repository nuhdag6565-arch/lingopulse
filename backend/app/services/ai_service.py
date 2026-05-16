"""Abstraction layer over OpenAI and Anthropic for example sentence generation.

Mobile networks are slow — the generated text is kept short on purpose.
"""

import logging
from dataclasses import dataclass

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class GeneratedExample:
    sentence: str
    translation: str


_PROMPT_TEMPLATE = (
    "Create ONE short English example sentence (max 15 words) using the word '{word}'. "
    "Then provide a Turkish translation of that sentence. "
    "Respond ONLY in this exact JSON format (no markdown, no extra text):\n"
    '{{"sentence": "...", "translation": "..."}}'
)


async def generate_example(word: str, meaning: str) -> GeneratedExample:
    prompt = _PROMPT_TEMPLATE.format(word=word)
    try:
        if settings.ai_provider == "anthropic":
            return await _call_anthropic(prompt)
        return await _call_openai(prompt)
    except Exception as exc:
        logger.warning("AI generation failed for '%s': %s", word, exc)
        return GeneratedExample(sentence="", translation="")


async def _call_openai(prompt: str) -> GeneratedExample:
    from openai import AsyncOpenAI
    import json

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model=settings.ai_model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=120,
        temperature=0.7,
    )
    raw = response.choices[0].message.content or ""
    data = json.loads(raw)
    return GeneratedExample(sentence=data["sentence"], translation=data["translation"])


async def _call_anthropic(prompt: str) -> GeneratedExample:
    import anthropic
    import json

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    message = await client.messages.create(
        model=settings.ai_model,
        max_tokens=120,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text
    data = json.loads(raw)
    return GeneratedExample(sentence=data["sentence"], translation=data["translation"])
