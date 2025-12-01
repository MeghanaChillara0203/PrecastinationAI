import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Task, TaskCategory, UserProfile, QuizQuestion, HelpContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Helpers ---

const cleanJson = (text: string): string => {
  // Remove markdown code blocks (```json ... ```)
  let cleaned = text.replace(/```json\n?|```/g, '');
  
  // Find the first '{' and last '}' to handle any preamble/postamble text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned.trim();
};

// --- Schemas ---

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0-based)" },
        },
        required: ["question", "options", "correctIndex"],
      },
    },
  },
  required: ["questions"],
};

const helpContentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    resources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["video", "article", "code"] },
        },
        required: ["title", "url", "type"],
      },
    },
    actionableSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    messageDraft: { type: Type.STRING, description: "Only for networking tasks" },
  },
  required: ["summary", "keyPoints", "resources", "actionableSteps"],
};

// --- API Calls ---

export const generateQuizForTask = async (task: Task, contextUrl?: string): Promise<QuizQuestion[]> => {
  const modelId = 'gemini-2.5-flash';
  
  let prompt = `Generate a 5-question multiple choice quiz to verify completion of: "${task.title}". 
  Desc: "${task.description}". Category: ${task.category}.
  IMPORTANT: Return ONLY raw JSON. No markdown formatting.`;

  if (contextUrl) {
    prompt += ` User resource: ${contextUrl}. Base questions on this.`;
  }

  if (task.category === TaskCategory.NETWORKING) {
    prompt = `User contacted recruiters. Generate 5 questions checking specific details (e.g. "What city was the recruiter in?", "What skill did they mention?").`;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const cleanedText = cleanJson(response.text || '');
    const data = JSON.parse(cleanedText);
    return data.questions || [];
  } catch (error) {
    console.error("Quiz generation failed", error);
    // Fallback question if AI fails so app doesn't crash
    return [{
        question: "AI Verification currently unavailable. Did you honestly complete the task?",
        options: ["Yes, I promise", "No, not yet"],
        correctIndex: 0
    }];
  }
};

export const verifyNetworkingNames = async (names: string[], task: Task): Promise<boolean> => {
  const modelId = 'gemini-2.5-flash';
  const prompt = `User contacted these people: ${names.join(', ')} for task "${task.title}". 
  Are these plausible names or related to the context? Return JSON: { "verified": boolean }.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: { verified: { type: Type.BOOLEAN } },
        }
      }
    });
    const cleanedText = cleanJson(response.text || '');
    const data = JSON.parse(cleanedText);
    return data.verified !== false; // Default to true if undefined
  } catch (e) {
    console.error("Verify names failed", e);
    return true; // Fallback to trust if AI fails
  }
};

export const getHelpForTask = async (task: Task, userProfile: UserProfile): Promise<HelpContent> => {
  const modelId = 'gemini-2.5-flash';
  
  let prompt = `Help user finish task: "${task.title}". 
  Context: "${task.description}". 
  User Bio: "${userProfile.bio}".
  User Document Content: "${userProfile.documentContent || 'None'}".
  
  Provide a guide, resources, and steps. 
  IMPORTANT: Return ONLY raw JSON. No markdown formatting.`;

  if (task.category === TaskCategory.NETWORKING) {
    prompt += ` Find 5 types of people to contact. Write a 250-char connection msg based on Bio/Doc.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: helpContentSchema,
      },
    });

    // Sometimes text is null if it only returns grounding metadata, but usually with responseSchema it returns text
    const text = response.text || '{}';
    const cleanedText = cleanJson(text);
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Help generation failed", error);
    // Return dummy content so modal opens even if AI fails
    return {
        summary: "We couldn't connect to the AI right now (Check API Key or Quota). Here is a generic strategy.",
        keyPoints: ["Break the task into 5 minute chunks", "Remove phone distractions", "Just start writing"],
        resources: [{ title: "Pomodoro Technique", url: "https://todoist.com/productivity-methods/pomodoro-technique", type: "article" }],
        actionableSteps: ["Set a timer for 25 minutes", "Work on the first step only"],
        messageDraft: ""
    };
  }
};

export const generateSpreadsheet = async (tasks: Task[], userProfile: UserProfile): Promise<{ title: string; content: string }> => {
  const modelId = 'gemini-2.5-flash';
  
  const tasksSummary = tasks.map(t => ({
    title: t.title,
    status: t.status,
    category: t.category,
    dueDate: t.dueDate
  }));

  const prompt = `
    Act as a productivity analyst. Create a CSV report for these tasks: ${JSON.stringify(tasksSummary)}.
    The user is: ${userProfile.name}.
    
    CSV Format Rules:
    1. First line must be headers: "Task Name, Category, Status, Due Date, AI Notes".
    2. "AI Notes" column should be a short, encouraging or analytical 5-word comment on the task status.
    3. Return ONLY the raw CSV text. No markdown blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    
    // Basic cleanup to ensure it's just CSV
    let csvContent = response.text || '';
    csvContent = csvContent.replace(/```csv|```/g, '').trim();
    
    const filename = `Productivity_Report_${new Date().toISOString().split('T')[0]}.csv`;
    
    return {
        title: filename,
        content: csvContent
    };

  } catch (error) {
    console.error("Spreadsheet generation failed", error);
    return {
        title: 'Error_Report.csv',
        content: 'Error,Could not generate report\nPlease,Try again later'
    };
  }
}