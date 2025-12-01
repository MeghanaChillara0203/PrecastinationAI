# 🌟 PrecastinationAI

### *“An AI Companion That Helps You Do the Things You Keep Avoiding.”*

PrecastinationAI is a multi-agent productivity companion designed for people who struggle with procrastination. Unlike simple todo apps, PrecastinationAI verifies your work, guides you when you’re stuck, and learns your habits over time. It provides accountability, learning support, and emotional engagement through animated characters and autonomous agents.

This project was built for the **Google × Kaggle Agents Intensive Capstone (2025)** and demonstrates advanced multi-agent system design, memory, session flow, and AI-powered assistance.

---

# 📌 Table of Contents

1. [Vision](#vision)
2. [Features](#features)
3. [Architecture Overview](#architecture-overview)
4. [Agents Explained](#agents-explained)
5. [Folder Structure](#folder-structure)
6. [Prerequisites](#prerequisites)
7. [Installation & Running Locally](#installation--running-locally)
8. [Running in Kaggle](#running-in-kaggle)
9. [API Routes](#api-routes)
10. [Tech Stack](#tech-stack)
11. [Future Work](#future-work)

---

# 🎯 Vision

Most productivity tools fail because they treat procrastination as a scheduling issue.
But procrastination is emotional, cognitive, and behavioral.
What people really need is:

* A **companion**, not a checklist
* **Verification**, not self-reported progress
* **Guidance**, not generic motivation
* **Memory**, not isolated tasks
* **Accountability**, not guilt

PrecastinationAI reimagines productivity as a **relationship**:

> “An AI partner who cares enough to help you start, stay, and finish.”

---

# 🚀 Features

### ✔ Multi-Agent System

Four autonomous agents collaborate to handle normalization, verification, help, and long-term memory.

### ✔ AI Verification (“Procrastination Police”)

Quizzes and contextual checks ensure tasks were actually completed.

### ✔ Intelligent Help Mode

If you get stuck or fail a quiz, HelpAgent generates:

* step-by-step guides
* curated resources
* plans
* study breakdowns
* networking message drafts

### ✔ Companion Characters

Choose from multiple animated avatars (panda, cat, dog, etc.) that react emotionally to your progress.

### ✔ Kanban Task Management

Drag & drop between *To Do* → *In Progress* → *Completed*.

### ✔ Calendar View

Visualize tasks by due date.

### ✔ Document Generation

AI-powered CSV productivity reports.

### ✔ Local JSON Persistence

Tasks and profiles saved locally.

---

# 🧠 Architecture Overview

### High-Level Pipeline

```
Frontend → Backend → OrchestratorAgent → Sub-agents → Response → Frontend
```

### Agents & Routing

1. **TaskAgent**

   * Normalizes raw input
   * Determines complexity, keywords, category
   * Routes to next agent

2. **QuizAgent**

   * Generates quizzes
   * Grades answers
   * Pass → MemoryAgent
   * Fail → HelpAgent

3. **HelpAgent**

   * Produces guides, explanations, resources, drafts

4. **MemoryAgent**

   * Updates long-term mastery
   * Suggests next tasks

The backend runs these agents through `OrchestratorAgent`.

---

# 🤖 Agents Explained

## 🔹 TaskAgent

**Purpose**: Turn user-written tasks into structured metadata.
**Output**: normalized title, keywords, category, complexity, and routing decision.

Used for:

* routing
* planning
* building context for other agents

---

## 🔹 QuizAgent

**Purpose**: Verify users actually completed the task.
Supports:

* Multiple-choice quizzes
* Context-url research checks
* Networking name plausibility checks

---

## 🔹 HelpAgent

**Purpose**: If the user is stuck or fails verification, HelpAgent generates:

* summaries
* steps
* educational resources
* networking templates
* custom advice using user profile

---

## 🔹 MemoryAgent

**Purpose**: Maintain long-term user mastery.
Stores:

* past quiz performance
* topic mastery scores
* growing knowledge base

---

# 📂 Folder Structure

```
project-root/
│
├── backend/
│   ├── agents/
│   │   ├── task_agent.py
│   │   ├── quiz_agent.py
│   │   ├── help_agent.py
│   │   ├── memory_agent.py
│   │   └── orchestrator_agent.py
│   ├── data/
│   │   ├── tasks.json
│   │   └── profile.json
│   ├── main.py               # FastAPI backend entrypoint
│   └── requirements.txt
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx
        ├── services/geminiService.ts
        ├── components/...
        ├── views/...
        ├── types.ts
        └── constants.ts
```

---

# 📦 Prerequisites

### 🟥 Required API Key

You need a **Google Gemini API key**.

```
export GOOGLE_API_KEY="your_api_key_here"
```

### 🟦 Backend Requirements

Install:

```
fastapi
uvicorn
google-genai
python-multipart
```

(Provided in `backend/requirements.txt`)

### 🟩 Frontend Requirements

```
Node.js ≥ 18
npm or yarn or pnpm
```

---

# 🛠 Installation & Running Locally

## 1. Clone the repo

```bash
git clone https://github.com/yourname/precastinationai.git
cd precastinationai
```

---

## 2. Set up backend

```bash
cd backend
pip install -r requirements.txt
export GOOGLE_API_KEY="your_key_here"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend now runs at:

```
http://127.0.0.1:8000
```

---

## 3. Set up frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on Vite, usually:

```
http://localhost:5173
```

---

# 🧪 Running Inside Kaggle (Competition Execution)

Because Kaggle disallows background processes, we run FastAPI *inline*:

### 1. Set API key

```python
%env GOOGLE_API_KEY=your_key
```

### 2. Run FastAPI inside the notebook cell

```python
!uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### 3. Test endpoint

```python
import requests
requests.get("http://127.0.0.1:8000").json()
```

⚠ Note: The frontend cannot run inside Kaggle due to Node restrictions.
Use GitHub Codespaces, Local machine, or deploy backend → frontend separately.

---

# 🔌 API Routes

| Route                   | Method | Description                    |
| ----------------------- | ------ | ------------------------------ |
| `/process-task`         | POST   | Run multi-agent workflow start |
| `/submit-quiz`          | POST   | Submit quiz answers            |
| `/generate-help`        | POST   | Manual help request            |
| `/generate-quiz`        | POST   | Manual quiz generation         |
| `/verify-networking`    | POST   | Validate recruiter names       |
| `/generate-spreadsheet` | POST   | Create CSV summaries           |
| `/tasks`                | GET    | Load local tasks               |
| `/save-tasks`           | POST   | Save tasks                     |
| `/profile`              | GET    | Load user profile              |
| `/save-profile`         | POST   | Save profile                   |

---

# 🧰 Tech Stack

**Backend:**

* FastAPI
* Google Gemini API
* Python (async)
* Multi-agent architecture

**Frontend:**

* React + Vite
* TypeScript
* TailwindCSS
* Lucide icons
* Zustand (optional store)

**Data:**

* JSON persistence

---

# 🔮 Future Work

* User emotion prediction
* Companion voice support
* Adaptive quiz difficulty
* Multi-session memory
* Cloud deployment
* Real-time collaborative tasks
* Character animation upgrades

