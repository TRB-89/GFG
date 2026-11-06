import asyncio
import json
import pytest
import httpx
from unittest.mock import patch, AsyncMock
from pydantic import BaseModel

from backend.app.services.ai.provider import (
    AIProviderError,
    OpenAIProvider,
    GeminiProvider,
    DeterministicFallbackProvider,
    get_ai_provider,
    mask_sensitive_pii,
)


class DummySchema(BaseModel):
    summary: str
    score: int


def test_mask_sensitive_pii():
    text = "Contact candidate at priya.test@example.com or +91 9876543210. Aadhaar: 1234 5678 9012."
    masked = mask_sensitive_pii(text)
    assert "[EMAIL_REDACTED]" in masked
    assert "priya.test@example.com" not in masked
    assert "[PHONE_REDACTED]" in masked
    assert "9876543210" not in masked
    assert "[GOV_ID_REDACTED]" in masked
    assert "1234 5678 9012" not in masked


def test_deterministic_fallback_provider():
    provider = DeterministicFallbackProvider()

    async def _test():
        text = await provider.generate_text("Analyze career continuity")
        assert len(text) > 10

        structured = await provider.generate_structured_output(
            "Executive summary for career passport",
            DummySchema
        )
        assert "summary" in structured
        assert "readiness_tier" in structured

        emb = await provider.create_embedding("Python and SQL data analytics")
        assert len(emb) == 128
        # Ensure unit normalization
        norm = sum(x**2 for x in emb) ** 0.5
        assert abs(norm - 1.0) < 1e-4

    asyncio.run(_test())


def test_openai_provider_text_and_structured():
    provider = OpenAIProvider(api_key="sk-test-valid-key")

    async def _test():
        # 1. Mock generate_text
        mock_chat_res = httpx.Response(
            200,
            json={"choices": [{"message": {"content": "Verified career analysis output"}}]}
        )
        with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_req:
            mock_req.return_value = mock_chat_res
            text = await provider.generate_text("Candidate has email test@example.com")
            assert text == "Verified career analysis output"
            # Ensure PII was masked in call payload
            call_payload = mock_req.call_args[1]["json"]
            assert "[EMAIL_REDACTED]" in call_payload["messages"][1]["content"]

        # 2. Mock generate_structured_output
        mock_struct_res = httpx.Response(
            200,
            json={"choices": [{"message": {"content": json.dumps({"summary": "Strong returnee", "score": 92})}}]}
        )
        with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_req:
            mock_req.return_value = mock_struct_res
            struct = await provider.generate_structured_output("Analyze profile", DummySchema)
            assert struct["summary"] == "Strong returnee"
            assert struct["score"] == 92

        # 3. Mock create_embedding
        mock_emb_res = httpx.Response(
            200,
            json={"data": [{"embedding": [0.1, 0.2, 0.3]}]}
        )
        with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_req:
            mock_req.return_value = mock_emb_res
            emb = await provider.create_embedding("Machine Learning")
            assert emb == [0.1, 0.2, 0.3]

    asyncio.run(_test())


def test_openai_provider_retries_transient_and_fails_loudly():
    provider = OpenAIProvider(api_key="sk-test-key", max_retries=1)

    async def _test():
        # First call returns 503, second returns 200
        mock_503 = httpx.Response(503, json={"error": "temporarily overloaded"})
        mock_200 = httpx.Response(200, json={"choices": [{"message": {"content": "Recovered response"}}]})

        with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_req:
            mock_req.side_effect = [mock_503, mock_200]
            res = await provider.generate_text("Retry test")
            assert res == "Recovered response"
            assert mock_req.call_count == 2

        # Non-retryable 401 Unauthorized raises AIProviderError
        mock_401 = httpx.Response(401, json={"error": "invalid api key"})
        with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_req:
            mock_req.return_value = mock_401
            with pytest.raises(AIProviderError) as exc:
                await provider.generate_text("Auth fail test")
            assert exc.value.provider == "OpenAI"
            assert exc.value.status_code == 401

    asyncio.run(_test())


def test_gemini_provider_text_structured_and_embedding():
    provider = GeminiProvider(api_key="gemini-test-key")

    async def _test():
        # 1. Text generation
        mock_gen = httpx.Response(
            200,
            json={"candidates": [{"content": {"parts": [{"text": "Gemini generated text analysis"}]}}]}
        )
        with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_req:
            mock_req.return_value = mock_gen
            text = await provider.generate_text("Assess returnship readiness for user@test.org")
            assert text == "Gemini generated text analysis"
            # Verify PII masking
            call_payload = mock_req.call_args[1]["json"]
            assert "[EMAIL_REDACTED]" in call_payload["contents"][0]["parts"][0]["text"]

        # 2. Structured JSON generation
        mock_struct = httpx.Response(
            200,
            json={"candidates": [{"content": {"parts": [{"text": json.dumps({"summary": "Gemini structured", "score": 95})}]}}]}
        )
        with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_req:
            mock_req.return_value = mock_struct
            struct = await provider.generate_structured_output("Generate structured profile", DummySchema)
            assert struct["summary"] == "Gemini structured"
            assert struct["score"] == 95

        # 3. Embedding
        mock_emb = httpx.Response(
            200,
            json={"embedding": {"values": [0.05, 0.15, 0.25]}}
        )
        with patch.object(httpx.AsyncClient, "request", new_callable=AsyncMock) as mock_req:
            mock_req.return_value = mock_emb
            emb = await provider.create_embedding("Semantic query")
            assert emb == [0.05, 0.15, 0.25]

    asyncio.run(_test())


def test_get_ai_provider_precedence():
    # 1. Neither key configured -> Fallback
    with patch.dict("os.environ", {"GEMINI_API_KEY": "", "AI_API_KEY": ""}):
        p = get_ai_provider()
        assert isinstance(p, DeterministicFallbackProvider)

    # 2. GEMINI_API_KEY configured -> GeminiProvider
    with patch.dict("os.environ", {"GEMINI_API_KEY": "AIzaSyTestGeminiValidKey123", "AI_API_KEY": ""}):
        p = get_ai_provider()
        assert isinstance(p, GeminiProvider)
        assert p.api_key == "AIzaSyTestGeminiValidKey123"

    # 3. AI_API_KEY configured -> OpenAIProvider
    with patch.dict("os.environ", {"GEMINI_API_KEY": "", "AI_API_KEY": "sk-proj-testOpenAIValidKey123"}):
        p = get_ai_provider()
        assert isinstance(p, OpenAIProvider)
        assert p.api_key == "sk-proj-testOpenAIValidKey123"

    # 4. Explicit provider_type requested
    with patch.dict("os.environ", {"GEMINI_API_KEY": "AIzaSyTestGeminiValidKey123", "AI_API_KEY": "sk-proj-testOpenAIValidKey123"}):
        p_gemini = get_ai_provider("gemini")
        assert isinstance(p_gemini, GeminiProvider)
        p_openai = get_ai_provider("openai")
        assert isinstance(p_openai, OpenAIProvider)

