import { TaskCategory } from "./types";

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  [TaskCategory.RESEARCH]: 'bg-purple-500',
  [TaskCategory.NETWORKING]: 'bg-blue-500',
  [TaskCategory.JOB_APPLICATION]: 'bg-green-500',
  [TaskCategory.LEARNING]: 'bg-yellow-500',
  [TaskCategory.OTHER]: 'bg-gray-500',
};

export const MOCK_INITIAL_TASKS = [
  {
    id: 't1',
    title: 'Learn Python Heaps',
    description: 'Understand the heap data structure and solve 3 medium problems.',
    category: TaskCategory.LEARNING,
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:00',
    aiAccess: 'Check Progress (Quiz/Verify)',
    reminder: '30 mins before',
    status: 'Todo',
    order: 0,
    verificationFailedCount: 0,
  },
  {
    id: 't2',
    title: 'Message Recruiters',
    description: 'Reach out to 5 recruiters from Google via LinkedIn.',
    category: TaskCategory.NETWORKING,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '10:00',
    aiAccess: 'Check Progress (Quiz/Verify)',
    reminder: 'At completion time',
    status: 'In Progress',
    order: 1,
    verificationFailedCount: 0,
  }
];
