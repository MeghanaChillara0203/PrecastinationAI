// FRONTEND SERVICE LAYER – Calls FastAPI backend instead of Gemini directly.

import { Task, UserProfile } from "../types";

// The backend URL (Kaggle notebook runs FastAPI at localhost:8000)
const API_BASE = "http://127.0.0.1:8000";

//---------------------------------------------------------
// POST helper
//---------------------------------------------------------
async function postJson<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch (e) {
    throw new Error(`Invalid JSON from backend: ${path}`);
  }

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/*                               QUIZ GENERATION                               */
/* -------------------------------------------------------------------------- */

export async function generateQuizForTask(task: Task, contextUrl?: string) {
  const resp: any = await postJson("/process-task", {
    title: task.title,
    description: task.description,
    category: task.category,
    contextUrl
  });

  // ================================ SAFE PARSING ================================
  // We always return an array (never undefined)
  const questions =
    Array.isArray(resp?.quiz?.questions)
      ? resp.quiz.questions
      : [];

  return questions;
}

/* -------------------------------------------------------------------------- */
/*                                  HELP FLOW                                 */
/* -------------------------------------------------------------------------- */

export async function getHelpForTask(task: Task, user: UserProfile) {
  const resp: any = await postJson("/process-task", {
    title: task.title,
    description: task.description,
    category: task.category,
    userProfile: user
  });

  // Backend may return:
  // { help: {...} }
  // { stage: "help", help: {...} }
  // Or even the help object directly (rare)

  const help = resp?.help || resp;

  // Return null if malformed
  if (!help || typeof help !== "object") return null;

  // Guaranteed normalized object
  return {
    summary: help.summary || "",
    keyPoints: help.keyPoints || help.steps || [],
    actionableSteps: help.actionableSteps || help.steps || [],
    messageDraft: help.messageDraft || null,
    resources: (help.resources || []).map((r: any) => ({
      type: r.type || "RESOURCE",
      title: r.title,
      url: r.url
    }))
  };
}

/* -------------------------------------------------------------------------- */
/*                           VERIFY NETWORKING NAMES                           */
/* -------------------------------------------------------------------------- */

export async function verifyNetworkingNames(names: string[], task: Task) {
  const resp: any = await postJson("/verify-networking", {
    names,
    task
  });

  return !!resp?.verified;
}

/* -------------------------------------------------------------------------- */
/*                          GRADE QUIZ + MEMORY AGENT                          */
/* -------------------------------------------------------------------------- */

export async function submitQuizAnswers(
  normalizedTask: any,
  quiz: any,
  userAnswers: number[]
) {
  return await postJson("/submit-quiz", {
    normalized: normalizedTask,
    quiz,
    answers: userAnswers
  });
}

/* -------------------------------------------------------------------------- */
/*                         SPREADSHEET / CSV GENERATION                        */
/* -------------------------------------------------------------------------- */

export async function generateSpreadsheet(tasks: Task[], user: UserProfile) {
  return await postJson("/generate-spreadsheet", {
    tasks,
    user
  });
}
