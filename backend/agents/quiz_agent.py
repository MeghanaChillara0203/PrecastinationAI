from google import genai
import json

class QuizAgent:
    """
    Generates quizzes + grades answers.
    """

    def __init__(self, api_key: str, model="gemini-2.0-flash"):
        if not api_key:
            raise ValueError("QuizAgent requires a GOOGLE_API_KEY.")
        self.client = genai.Client(api_key=api_key)
        self.model = model

    async def generate_quiz(self, task: dict):
        """
        Returns a JSON quiz:
        {
          "questions": [
            { "question": "...", "options": [...], "correctIndex": n }
          ]
        }
        """

        prompt = f"""
You are QuizAgent.

Create a 5-question multiple-choice quiz that tests real understanding.

Task:
Title: {task.get("normalizedTitle")}
Description: {task.get("normalizedDescription")}
Keywords: {task.get("keywords")}

Return JSON ONLY in this exact schema:
{{
  "questions": [
    {{
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0
    }}
  ]
}}
"""

        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
            config={"responseMimeType": "application/json"}
        )

        raw = response.text
        print("\n=== RAW QUIZ MODEL OUTPUT ===\n", raw, "\n")

        try:
            return json.loads(raw)
        except Exception as e:
            print("QUIZ JSON PARSE FAILED:", e)

            return {
                "questions": [
                    {
                        "question": "Fallback question: Which option is correct?",
                        "options": ["A", "B", "C", "D"],
                        "correctIndex": 0
                    }
                ]
            }

    async def grade_answers(self, quiz: dict, user_answers: list):
        """
        Returns:
        {
          score: float,
          passed: bool,
          details: [...],
          nextAgent: "HelpAgent" or "MemoryAgent"
        }
        """

        questions = quiz.get("questions", [])
        total = len(questions)
        correct = 0
        details = []

        for i, q in enumerate(questions):
            correct_idx = q["correctIndex"]
            user_idx = user_answers[i] if i < len(user_answers) else None
            is_correct = user_idx == correct_idx

            if is_correct:
                correct += 1

            details.append({
                "question": q.get("question"),
                "userAnswer": user_idx,
                "correctAnswer": correct_idx,
                "isCorrect": is_correct
            })

        score = correct / total if total else 0
        passed = score >= 0.8

        return {
            "score": score,
            "passed": passed,
            "details": details,
            "nextAgent": "MemoryAgent" if passed else "HelpAgent"
        }
