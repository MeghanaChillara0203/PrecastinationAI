import json
from datetime import datetime
import google.genai as genai


class MemoryAgent:
    """
    Tracks task history, quiz scores, and mastery trends.
    """

    def __init__(self, api_key: str, storage_path="memory.json", model="gemini-2.0-flash"):
        if not api_key:
            raise ValueError("MemoryAgent requires an API key.")

        self.client = genai.Client(api_key=api_key)
        self.model = model
        self.storage_path = storage_path

        try:
            with open(storage_path, "r") as f:
                self.memory = json.load(f)
        except FileNotFoundError:
            self.memory = {"history": [], "skills": {}}

    def save(self):
        with open(self.storage_path, "w") as f:
            json.dump(self.memory, f, indent=2)

    async def update_from_quiz(self, task: dict, quiz_results: dict):
        """
        Store quiz performance and update mastery level.
        """

        score = quiz_results.get("score", 0)
        passed = quiz_results.get("passed", False)
        title = task.get("normalizedTitle", "Untitled")

        # Log the quiz
        self.memory["history"].append({
            "title": title,
            "score": score,
            "passed": passed,
            "timestamp": datetime.now().isoformat()
        })

        # Update mastery score (between 0 and 1)
        current = self.memory["skills"].get(title, 0.5)
        delta = (score - 0.5) * 0.3
        self.memory["skills"][title] = max(0, min(1, current + delta))

        self.save()

        return {
            "mastery": self.memory["skills"][title],
            "passed": passed,
            "nextAgent": "None" if passed else "HelpAgent"
        }

    async def recommend_next_tasks(self):
        """
        Ask Gemini to suggest future tasks based on mastery levels.
        """

        prompt = f"""
Based on mastery scores:
{json.dumps(self.memory['skills'], indent=2)}

Recommend 3 ideal next tasks.

Return ONLY JSON:
{{
  "recommendations": [
    {{"title": "string", "reason": "string"}},
    {{"title": "string", "reason": "string"}},
    {{"title": "string", "reason": "string"}}
  ]
}}
"""

        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "responseMimeType": "application/json"
            }
        )

        return json.loads(response.text)
