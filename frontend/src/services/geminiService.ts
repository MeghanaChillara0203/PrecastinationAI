// FRONTEND SERVICE LAYER – Calls FastAPI backend instead of Gemini directly.

import { Task, UserProfile } from "../types";

// The backend URL (Kaggle notebook runs FastAPI at localhost:8000)
const API_BASE = "http://127.0.0.1:8000";

// Helper: POST wrapper
async function postJson<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return await res.json();
}

/* -------------------------------------------------------------------------- */
/*                               QUIZ GENERATION                               */
/* -------------------------------------------------------------------------- */

export async function generateQuizForTask(task: Task, contextUrl?: string) {
  return postJson("/process-task", {
    title: task.title,
    description: task.description,
    category: task.category,
    contextUrl
  }).then((resp) => resp.quiz?.questions || []);
}

/* -------------------------------------------------------------------------- */
/*                                  HELP FLOW                                 */
/* -------------------------------------------------------------------------- */

export async function getHelpForTask(task: Task, user: UserProfile) {
  return postJson("/process-task", {
    title: task.title,
    description: task.description,
    category: task.category,
    userProfile: user
  }).then((resp) => resp.help);
}

/* -------------------------------------------------------------------------- */
/*                           VERIFY NETWORKING NAMES                           */
/* -------------------------------------------------------------------------- */

export async function verifyNetworkingNames(names: string[], task: Task) {
  return postJson("/verify-networking", {
    names,
    task
  }).then((resp) => resp.verified);
}

/* -------------------------------------------------------------------------- */
/*                          GRADE QUIZ + MEMORY AGENT                          */
/* -------------------------------------------------------------------------- */

export async function submitQuizAnswers(
  normalizedTask: any,
  quiz: any,
  userAnswers: number[]
) {
  return postJson("/submit-quiz", {
    normalized: normalizedTask,
    quiz,
    answers: userAnswers
  });
}

/* -------------------------------------------------------------------------- */
/*                         SPREADSHEET / CSV GENERATION                        */
/* -------------------------------------------------------------------------- */

export async function generateSpreadsheet(tasks: Task[], user: UserProfile) {
  return postJson("/generate-spreadsheet", {
    tasks,
    user
  });
}
