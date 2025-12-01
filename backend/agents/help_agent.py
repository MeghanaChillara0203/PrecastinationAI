import json
import google.genai as genai


def extract_json(raw_text: str):
    """
    Extract JSON from messy LLM output safely.
    """
    if not raw_text:
        raise ValueError("Empty response text")

    cleaned = raw_text.replace("```json", "").replace("```", "").strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start == -1 or end == -1:
        raise ValueError("Could not find JSON braces in LLM text.")

    return json.loads(cleaned[start:end+1])


class HelpAgent:
    """
    Generates structured help content:
      - summary
      - actionable steps
      - external resources
    """

    def __init__(self, api_key: str, model="gemini-2.0-flash"):
        if not api_key:
            raise ValueError("HelpAgent requires an API key.")
        self.client = genai.Client(api_key=api_key)
        self.model = model

    async def generate_help(self, task: dict):
        """
        Return structured JSON help content.
        """

        title = task.get("normalizedTitle", task.get("title", ""))
        desc = task.get("normalizedDescription", task.get("description", ""))

        prompt = f"""
You are a productivity assistant.

Return ONLY valid JSON in this exact schema:

{{
  "summary": "short explanation",
  "steps": ["step 1", "step 2", "step 3"],
  "resources": [
    {{"title": "Resource 1", "url": "https://example.com"}},
    {{"title": "Resource 2", "url": "https://example.com"}}
  ]
}}

Task to help with:
Title: {title}
Description: {desc}
"""

        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "object",
                    "properties": {
                        "summary": {"type": "string"},
                        "steps": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "resources": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string"},
                                    "url": {"type": "string"}
                                },
                                "required": ["title", "url"]
                            }
                        }
                    },
                    "required": ["summary", "steps", "resources"]
                }
            }
        )

        raw = response.text
        print("\n=== RAW HELP MODEL OUTPUT ===\n", raw, "\n")

        # Should already be valid JSON
        try:
            return json.loads(raw)
        except Exception:
            try:
                return extract_json(raw)
            except Exception as e:
                print("JSON parsing failed:", e)
                print("RAW TEXT:\n", raw)
                return {
                    "summary": "Failed to generate help.",
                    "steps": ["Try again later."],
                    "resources": []
                }
