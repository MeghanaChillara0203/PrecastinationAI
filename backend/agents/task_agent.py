from google import genai
import json

class TaskAgent:
    """
    Normalizes tasks and determines which agent should run next.
    """

    def __init__(self, api_key: str, model="gemini-2.0-flash"):
        if not api_key:
            raise ValueError("TaskAgent requires a GOOGLE_API_KEY.")
        self.client = genai.Client(api_key=api_key)
        self.model = model

    async def analyze_task(self, task: dict):
        """
        Normalize input task and decide next agent.
        """

        prompt = f"""
You are TaskAgent.

Your job:
- Normalize the task
- Identify category
- Extract keywords
- Estimate complexity (1–10)
- Choose next agent

Return JSON ONLY with the shape:
{{
  "normalizedTitle": "string",
  "normalizedDescription": "string",
  "category": "string",
  "keywords": ["list", "of", "keywords"],
  "complexity": 1-10,
  "nextAgent": "QuizAgent" or "HelpAgent" or "NetworkingAgent"
}}

Task:
Title: {task.get("title")}
Description: {task.get("description")}
Category: {task.get("category")}
"""

        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
            config={"responseMimeType": "application/json"}
        )

        raw = response.text
        print("\n=== RAW TASKAGENT OUTPUT ===\n", raw)

        # Try safe JSON decode
        try:
            return json.loads(raw)
        except Exception:
            print("JSON parsing failed. Falling back to defaults.")

            return {
                "normalizedTitle": task.get("title"),
                "normalizedDescription": task.get("description"),
                "category": task.get("category") or "General",
                "keywords": [],
                "complexity": 5,
                "nextAgent": "QuizAgent"
            }

    async def process_task(self, task: dict):
        """
        Wrapper so OrchestratorAgent can call this uniformly.
        """
        return await self.analyze_task(task)
