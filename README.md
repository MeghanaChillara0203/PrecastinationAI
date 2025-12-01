# PrecastinationAI

PrecastinationAI is an intelligent, companion-driven task management application designed to help procrastinators get things done. Unlike standard todo lists, it uses AI to actively verify your work, offer help when you're stuck, and provide emotional support through interactive animated characters.

## Features

- **Interactive Kanban Board**: Drag-and-drop tasks between "To Do" and "In Progress".
- **AI Companions**: Choose from 6 animated characters (Panda, Bear, Cat, Dog, etc.) that react to your progress with real-time animations (Success, Failure, Thinking).
- **AI Verification**: The "Procrastination Police" checks if you actually did the work via quizzes or context verification.
- **Smart Assistance**: Stuck on a task? The AI generates study guides, research summaries, and networking message drafts.
- **Documents & Reporting**: Auto-generate Excel/CSV progress reports of your tasks.
- **Gamified Progress**: Visual tracking of your productivity.

Here is a **clean, polished, professional README** tailored to your exact repo, architecture, agents, notebooks, and execution flow.

It combines:

* **Multi-Agent Backend** (FastAPI + Google Gemini)
* **Interactive Frontend** (React + Vite + Tailwind)
* **Local Data Persistence**
* **Smart Task Verification**
* **Personalized Help & Learning**

---

# 📘 **Notebook Overview**

### **1. `ProcrastinationAI.ipynb` — Agent Creation Notebook**

This notebook contains:

✔ Development of all **AI agents**
✔ Iterative testing of agent logic
✔ Running FastAPI in Kaggle
✔ Direct interaction with agents
✔ Final API-ready versions of TaskAgent, QuizAgent, HelpAgent & MemoryAgent

### **2. `ProcrastinationAI-Backend.ipynb` — Backend + Frontend Assembly**

This notebook contains:

✔ Writing the FastAPI backend
✔ Saving agent files to `/backend/agents`
✔ Generating the frontend folder structure
✔ Writing all React, TypeScript, and service files programmatically
✔ Running and testing the backend API endpoints
✔ Final folder structure ready for download / deployment

---

# 🧠 **AI Agent Architecture**

ProcrastinationAI uses **four fully independent agents**, orchestrated by a master controller.
Each agent has a single responsibility and communicates only through normalized task packets.

---

## 🔹 **1. TaskAgent — Task Normalization & Routing**

**Purpose:**
Take raw user tasks and convert them into a clean, structured format the other agents can process.

**Capabilities:**

* Normalizes task titles & descriptions
* Extracts category, keywords, complexity
* Decides next step:
  → **QuizAgent** (if learning/research task)
  → **HelpAgent** (if user needs guidance)
  → **MemoryAgent** (if updating long-term knowledge)

**Output Example:**

```json
{
  "normalizedTitle": "Learn React Fundamentals",
  "normalizedDescription": "Study core React concepts.",
  "category": "EDUCATION",
  "keywords": ["React", "JSX", "hooks"],
  "complexity": 4,
  "nextAgent": "HelpAgent"
}
```

---

## 🔹 **2. QuizAgent — Adaptive Knowledge Verification**

**Purpose:**
Ensure the user has actually learned/researched what they claim.

**Capabilities:**

* Generates dynamic quizzes based on task context
* Grades user answers
* Determines pass/fail state
* Pass → MemoryAgent
* Fail → HelpAgent

**Quiz Example Output:**

```json
{
  "questions": [
    {
      "q": "What is JSX used for in React?",
      "choices": ["Styling", "Logic", "UI markup", "Animations"],
      "answer": 2
    }
  ]
}
```

---

## 🔹 **3. HelpAgent — Guidance, Coaching & Resources**

**Purpose:**
Provide intelligent help to unblock users.

**Capabilities:**

* Generates step-by-step guides
* Provides explanations in the user's preferred character style
* Provides actionable resources
* Reacts when verification fails

**Output Example:**

```json
{
  "summary": "Learn fundamental React concepts...",
  "steps": ["Understand JSX", "Learn components", ...],
  "resources": [{ "title": "React Docs", "url": "https://react.dev" }]
}
```

---

## 🔹 **4. MemoryAgent — Long-Term User Learning**

**Purpose:**
Store what the user has learned to avoid repeating help.

**Capabilities:**

* Updates persistent memory
* Enhances future help generation
* Tracks knowledge progression

Memory is saved into:

```
backend/data/tasks.json
backend/data/profile.json
```

---

# 🎛 **OrchestratorAgent — Multi-Agent Controller**

This is the master brain that:

1. Calls TaskAgent
2. Routes to Quiz / Help
3. After quiz → Routes results to MemoryAgent
4. Returns final response to frontend

---

# 📂 **Project Structure**

```
/backend
    /agents
        task_agent.py
        help_agent.py
        quiz_agent.py
        memory_agent.py
        orchestrator_agent.py
    main.py
    requirements.txt

/frontend
    /src
        App.tsx
        /views (Home, Progress, Calendar, Profile, Documents)
        /services (geminiService.ts)
        /components
        /types
        /constants.ts
```

---

# ⚙️ **Backend Execution Instructions**

### **1. Set your API key in Kaggle**

```python
%env GOOGLE_API_KEY=your_key_here
```

### **2. Run FastAPI inside notebook**

```python
!pkill -f uvicorn
!uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

You should see:

```
INFO: Uvicorn running on http://0.0.0.0:8000
```

### **3. Test backend**

```python
import requests
requests.get("http://127.0.0.1:8000").json()
```

Should return:

```json
{"status": "backend running"}
```

---

# 🖥️ **Frontend Execution Instructions**

The frontend **cannot run inside Kaggle**.

Move the project to:

### Option A — **Local machine**

```bash
cd frontend
npm install
npm run dev
```

### Option B — **GitHub Codespaces**

* Upload repo
* Open Codespace
* Run frontend + backend normally

### Option C — **Deploy backend somewhere (Render, Railway)**

Change:

```ts
const API_BASE = "https://your-backend-url";
```

Then build React:

```bash
npm run build
```

Deploy anywhere (Vercel, Netlify, etc.)

---

# 📜 **Features Summary**

### ✔ Drag-and-drop task board

### ✔ Task progress + verification

### ✔ AI help modal with character avatars

### ✔ AI quiz verification flow

### ✔ Calendar view with task overlays

### ✔ Spreadsheet generation via backend

### ✔ Profile with AI character + document upload

### ✔ Local persistent JSON storage

---

# 🎯 **What This Project Demonstrates**

* Full multi-agent architecture
* Real-time coordination between agents
* True autonomous workflow: normalize → quiz/help → memory
* Production-ready backend API design
* Modern React UI using Tailwind, Lucide icons, and modals
* Integration between Vite frontend ↔ FastAPI backend

---
