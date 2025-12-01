export enum TaskCategory {
  RESEARCH = 'Research',
  NETWORKING = 'Networking',
  JOB_APPLICATION = 'Job Application',
  LEARNING = 'Learning',
  OTHER = 'Other',
}

export enum AIAccessLevel {
  CHECK_PROGRESS = 'Check Progress (Quiz/Verify)',
  STATUS_ONLY = 'Just Check Status',
}

export enum ReminderTime {
  THIRTY_MIN_BEFORE = '30 mins before',
  AT_COMPLETION = 'At completion time',
}

export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  FAILED_VERIFICATION = 'Failed Verification',
}

export enum CharacterType {
  MALE = 'Male',
  FEMALE = 'Female',
  CAT = 'Cat',
  DOG = 'Dog',
  BEAR = 'Bear',
  PANDA = 'Panda',
}

export interface UserProfile {
  name: string;
  email: string;
  bio: string; // The text summary
  documentName?: string; // Name of uploaded file
  documentContent?: string; // Content of uploaded file
  character: CharacterType;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string; // ISO Date string
  dueTime: string; // HH:mm
  aiAccess: AIAccessLevel;
  reminder: ReminderTime;
  status: TaskStatus;
  order: number; // For drag and drop
  verificationFailedCount: number;
  completedAt?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface HelpContent {
  summary: string;
  keyPoints: string[];
  resources: { title: string; url: string; type: 'video' | 'article' | 'code' }[];
  actionableSteps: string[];
  messageDraft?: string; // For networking
}

export interface GeneratedDocument {
  id: string;
  title: string;
  type: 'csv' | 'xlsx';
  date: string;
  content: string; // The CSV content string
}