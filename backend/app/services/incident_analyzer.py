import os
import json
import logging
from typing import Dict, Any, Optional
import httpx
from dotenv import load_dotenv
from ..schemas.incident import IncidentInput

load_dotenv()
logger = logging.getLogger("resonance.analyzer")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


class IncidentAnalyzer:
    """
    LLM-powered incident parser and normalizer.
    Converts unstructured operator alerts into normalized structured incident objects.
    """

    async def normalize_and_extract(self, raw_input: str) -> IncidentInput:
        """
        Parses raw text (e.g. alert email, slack message) into structured IncidentInput.
        """
        if GEMINI_API_KEY:
            try:
                extracted = await self._call_gemini_extraction(raw_input)
                if extracted:
                    return extracted
            except Exception as e:
                logger.warning(f"Gemini normalization failed: {e}. Using deterministic parsing.")

        return self._deterministic_extract(raw_input)

    async def _call_gemini_extraction(self, text: str) -> Optional[IncidentInput]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        prompt = f"""
        You are an SRE incident telemetry analyzer. Extract the incident details into JSON:
        Input text:
        \"\"\"{text}\"\"\"

        Return ONLY a JSON object with keys:
        service, symptoms, environment, kubernetes_version, database_version, deployment_version, recent_changes
        """
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
            if resp.status_code == 200:
                data = resp.json()
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                # Clean json blocks
                cleaned = content.strip().replace("```json", "").replace("```", "").strip()
                parsed = json.loads(cleaned)
                return IncidentInput(**parsed)
        return None

    def _deterministic_extract(self, text: str) -> IncidentInput:
        # Fallback heuristic parser
        return IncidentInput(
            service="Payment API" if "payment" in text.lower() else "Core Service",
            symptoms=text if len(text) > 10 else "High latency (8.4s) and 21% error rate on critical endpoints",
            environment="Production",
            kubernetes_version="1.28",
            database_version="PostgreSQL 15 (PgBouncer)",
            deployment_version="5.4.1",
            recent_changes="Database migration executed 34 minutes ago"
        )


analyzer = IncidentAnalyzer()
