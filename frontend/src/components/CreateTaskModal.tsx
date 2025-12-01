import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TaskCategory, AIAccessLevel, ReminderTime, TaskStatus, Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'order' | 'verificationFailedCount' | 'completedAt'> & { id?: string }) => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSubmit, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.LEARNING);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('12:00');
  const [aiAccess, setAiAccess] = useState<AIAccessLevel>(AIAccessLevel.CHECK_PROGRESS);
  const [reminder, setReminder] = useState<ReminderTime>(ReminderTime.THIRTY_MIN_BEFORE);
  const [error, setError] = useState('');
  
  const isEditing = !!taskToEdit;

  useEffect(() => {
    if (isEditing && taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate);
      setDueTime(taskToEdit.dueTime);
      setAiAccess(taskToEdit.aiAccess);
      setReminder(taskToEdit.reminder);
    } else {
      // Reset form when opening for create
      setTitle('');
      setDescription('');
      setCategory(TaskCategory.LEARNING);
      setDueDate('');
      setDueTime('12:00');
      setAiAccess(AIAccessLevel.CHECK_PROGRESS);
      setReminder(ReminderTime.THIRTY_MIN_BEFORE);
    }
  }, [taskToEdit, isEditing, isOpen]);


  // Get today's date in YYYY-MM-DD for min attribute
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate Date/Time
    const selectedDate = new Date(`${dueDate}T${dueTime}`);
    if (!isEditing && selectedDate < now) {
      setError('Please select a future date and time.');
      return;
    }

    onSubmit({
      id: taskToEdit?.id,
      title,
      description,
      category,
      dueDate,
      dueTime,
      aiAccess,
      reminder,
      status: taskToEdit?.status || TaskStatus.TODO
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl transform transition-all animation-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-card z-10">
          <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Task Name</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="e.g., Master React Hooks"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(TaskCategory).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === cat
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
              <div className="relative">
                <input
                  required
                  type="date"
                  min={todayStr}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none [color-scheme:dark] cursor-pointer"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Due Time</label>
              <div className="relative">
                <input
                  required
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none [color-scheme:dark] cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Detailed Explanation</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-dark border border-gray-700 rounded-xl px-4 py-3 text-white h-32 resize-none focus:ring-2 focus:ring-primary outline-none"
              placeholder="What exactly do you need to achieve?"
            />
          </div>

          {/* AI Settings */}
          <div className="bg-gray-800/50 p-4 rounded-xl space-y-4 border border-gray-700/50">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              AI Accountability Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Verification Method</label>
                  <select
                    value={aiAccess}
                    onChange={(e) => setAiAccess(e.target.value as AIAccessLevel)}
                    className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-secondary outline-none"
                  >
                    {Object.values(AIAccessLevel).map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Reminder Preference</label>
                  <select
                    value={reminder}
                    onChange={(e) => setReminder(e.target.value as ReminderTime)}
                    className="w-full bg-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-secondary outline-none"
                  >
                    {Object.values(ReminderTime).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
