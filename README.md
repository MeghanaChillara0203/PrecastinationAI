# PrecastinationAI

PrecastinationAI is an intelligent, companion-driven task management application designed to help procrastinators get things done. Unlike standard todo lists, it uses AI to actively verify your work, offer help when you're stuck, and provide emotional support through interactive animated characters.

## Features

- **Interactive Kanban Board**: Drag-and-drop tasks between "To Do" and "In Progress".
- **AI Companions**: Choose from 6 animated characters (Panda, Bear, Cat, Dog, etc.) that react to your progress with real-time animations (Success, Failure, Thinking).
- **AI Verification**: The "Procrastination Police" checks if you actually did the work via quizzes or context verification.
- **Smart Assistance**: Stuck on a task? The AI generates study guides, research summaries, and networking message drafts.
- **Documents & Reporting**: Auto-generate Excel/CSV progress reports of your tasks.
- **Gamified Progress**: Visual tracking of your productivity.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Google Gemini API Key (Get one for free at [Google AI Studio](https://aistudio.google.com/))

## Installation

1.  **Clone the repository** (or download the source code).
    ```bash
    git clone <repository-url>
    cd precastination-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

## Configuration (Important)

This application requires a Google Gemini API Key to function. It looks for the key in the `process.env.API_KEY` variable.

1.  Create a file named `.env` in the root directory of the project.
2.  Add your API key to the file:

    ```env
    API_KEY=your_google_gemini_api_key_here
    ```

    *Note: If you are using Vite, you might need to prefix it as `VITE_API_KEY` and update `services/geminiService.ts` to use `import.meta.env.VITE_API_KEY`, depending on your build tool. For standard webpack/CRA/StackBlitz environments, `process.env.API_KEY` is supported.*

## Running the Application

Start the development server:

```bash
npm start
# or
npm run dev
```

Open your browser to `http://localhost:3000` (or the port shown in your terminal).

## How to Use

1.  **Profile**: Go to the Profile tab to set your name and **Choose Your Character**. This character will be your productivity buddy.
2.  **Create Task**: On the Home screen, click "New Task". Fill in details and select an AI Verification level.
3.  **Do the Work**: Drag the task to "In Progress".
4.  **Check In**: When finished, click "Check In".
    *   **Yes**: The AI will quiz you or verify your work.
    *   **No**: The AI will offer to help you finish the task with resources and guides.

## Technologies

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (@google/genai)
- **Icons**: Lucide React
- **Drag & Drop**: @hello-pangea/dnd
- **Date Management**: date-fns
