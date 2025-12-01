import os
from agents.task_agent import TaskAgent
from agents.quiz_agent import QuizAgent
from agents.help_agent import HelpAgent
from agents.memory_agent import MemoryAgent


class OrchestratorAgent:
    """
    Controls the entire multi-agent workflow.
    """

    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not set in environment.")

        # Pass API key to all agents
        self.task_agent = TaskAgent(api_key=api_key)
        self.quiz_agent = QuizAgent(api_key=api_key)
        self.help_agent = HelpAgent(api_key=api_key)
        self.memory_agent = MemoryAgent(api_key=api_key)

    async def process(self, raw_task: dict):
        """
        STEP 1 — Normalize Task
        STEP 2 — Route to correct agent
        """

        print("\n=== ORCHESTRATOR STEP: TaskAgent ===")

        normalized = await self.task_agent.process_task(raw_task)
        print("Normalized:", normalized)

        next_agent = normalized.get("nextAgent", "HelpAgent")

        # -------------------------
        # ROUTE: QUIZ
        # -------------------------
        if next_agent == "QuizAgent":
            print("\n=== ORCHESTRATOR STEP: QuizAgent (Generating Quiz) ===")
            quiz = await self.quiz_agent.generate_quiz(normalized)

            return {
                "stage": "quiz",
                "normalized": normalized,
                "quiz": quiz
            }

        # -------------------------
        # ROUTE: HELP
        # -------------------------
        print("\n=== ORCHESTRATOR STEP: HelpAgent ===")
        help_data = await self.help_agent.generate_help(normalized)

        return {
            "stage": "help",
            "normalized": normalized,
            "help": help_data
        }

    async def submit_quiz(self, normalized_task: dict, quiz: dict, user_answers: list):
        """
        After quiz: grade → memory or help
        """

        print("\n=== ORCHESTRATOR STEP: Grade Quiz ===")
        result = await self.quiz_agent.grade_answers(quiz, user_answers)
        print("Quiz results:", result)

        # PASS
        if result["passed"]:
            print("\n=== ORCHESTRATOR STEP: MemoryAgent ===")
            mem = await self.memory_agent.update_from_quiz(normalized_task, result)

            return {
                "stage": "memory",
                "memory": mem
            }

        # FAIL → HELP
        print("\n=== ORCHESTRATOR STEP: HelpAgent ===")
        help_data = await self.help_agent.generate_help(normalized_task)

        return {
            "stage": "help",
            "help": help_data
        }
