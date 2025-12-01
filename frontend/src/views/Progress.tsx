import React, { useState } from 'react';
import {
  Clock, AlertCircle, CheckSquare, ChevronDown, ChevronUp,
  ArrowRight, Loader2, Trash2
} from 'lucide-react';

import { format, addHours, addDays } from 'date-fns';
import {
  Task, TaskStatus, TaskCategory, UserProfile
} from '../types';

import { CATEGORY_COLORS } from '../constants';
import { QuizModal } from '../components/AI/QuizModal';
import { HelpModal } from '../components/AI/HelpModal';
import { CharacterIllustration } from '../components/Illustrations';

/* -----------------------------------------------------------
   SAFELY NORMALIZE BACKEND HELP → FRONTEND HELP FORMAT
----------------------------------------------------------- */
const normalizeHelp = (help: any) => {
  const toArray = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      return val
        .split(/\n|•|-/)
        .map(v => v.trim())
        .filter(v => v.length > 0);
    }
    return [];
  };

  return {
    summary: help.summary || "Let's break this task down.",
    keyPoints: toArray(help.keyPoints || help.steps),
    actionableSteps: toArray(help.actionableSteps || help.steps),
    messageDraft: help.messageDraft || null,
    resources: (help.resources || []).map((r: any) => ({
      type: r.type || "RESOURCE",
      title: r.title || "Untitled",
      url: r.url || "#"
    }))
  };
};

/* -----------------------------------------------------------
   COMPONENT
----------------------------------------------------------- */
interface ProgressProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  userProfile: UserProfile;
}

export const Progress: React.FC<ProgressProps> = ({
  tasks,
  setTasks,
  userProfile
}) => {

  // ACTIVE & COMPLETED TASKS
  const activeTasks = tasks.filter(
    t => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.FAILED_VERIFICATION
  );
  const completedTasks = tasks.filter(
    t => t.status === TaskStatus.COMPLETED
  );

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [checkInTask, setCheckInTask] = useState<Task | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);

  // QUIZ STATE
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);

  // HELP STATE
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpContent, setHelpContent] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);


  /* -----------------------------------------------------------
     UI LOGIC
  ----------------------------------------------------------- */
  const toggleExpand = (id: string) =>
    setExpandedTaskId(expandedTaskId === id ? null : id);


  /* -----------------------------------------------------------
     DEADLINE EXTENSION
  ----------------------------------------------------------- */
  const handleExtendDeadline = (
    taskId: string,
    duration: { hours?: number; days?: number }
  ) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;

        const current = new Date(`${t.dueDate}T${t.dueTime}`);
        const newDate = duration.hours
          ? addHours(current, duration.hours)
          : addDays(current, duration.days || 0);

        return {
          ...t,
          dueDate: format(newDate, 'yyyy-MM-dd'),
          dueTime: format(newDate, 'HH:mm')
        };
      })
    );
  };


  /* -----------------------------------------------------------
     DELETE TASK
  ----------------------------------------------------------- */
  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Delete this task permanently?")) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };


  /* -----------------------------------------------------------
     CALL BACKEND → HELP
  ----------------------------------------------------------- */
  const launchHelp = async (task: Task) => {
    setHelpLoading(true);
    setShowHelp(true);

    const response = await fetch("http://127.0.0.1:8000/process-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        category: String(task.category).toUpperCase(),
        contextUrl: null,
        userProfile
      })
    });

    const data = await response.json();
    const safeHelp = normalizeHelp(data.help || data);

    setHelpContent(safeHelp);
    setHelpLoading(false);
  };


  /* -----------------------------------------------------------
     CHECK-IN
  ----------------------------------------------------------- */
  const initiateCheckIn = (task: Task) => setCheckInTask(task);

  const handleVerificationFail = (task: Task) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? { ...t, status: TaskStatus.FAILED_VERIFICATION, verificationFailedCount: t.verificationFailedCount + 1 }
          : t
      )
    );
  };

  const completeTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: TaskStatus.COMPLETED, completedAt: new Date().toISOString() }
          : t
      )
    );
    setShowQuiz(false);
  };


  /* -----------------------------------------------------------
     REQUEST QUIZ FROM BACKEND
  ----------------------------------------------------------- */
  const requestQuizFromBackend = async (task: Task, contextUrl?: string) => {

    const response = await fetch("http://127.0.0.1:8000/process-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        category: String(task.category).toUpperCase(),
        contextUrl: contextUrl || null,
        userProfile
      })
    });

    const data = await response.json();
    console.log("process-task returned:", data);

    if (data.stage === "quiz") {

      const normalized = (data.quiz.questions || []).map((q: any) => ({
        question: q.q,
        options: q.choices,
        correctIndex: q.answer
      }));

      setQuizQuestions(normalized);
      setShowQuiz(true);
    }

    else if (data.stage === "help") {
      const safeHelp = normalizeHelp(data.help || data);
      setHelpContent(safeHelp);
      setShowHelp(true);
    }

    else {
      console.error("Unexpected backend response:", data);
    }
  };


  /* -----------------------------------------------------------
     NETWORKING VERIFICATION
  ----------------------------------------------------------- */
  const requestNetworkingVerification = async (names: string[], task: Task) => {
    const response = await fetch("http://127.0.0.1:8000/verify-networking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        names,
        task: { ...task, category: String(task.category).toUpperCase() }
      })
    });

    const data = await response.json();
    return data.verified;
  };


  /* -----------------------------------------------------------
     CHECK-IN RESPONSE HANDLER
  ----------------------------------------------------------- */
  const handleCheckInResponse = async (yes: boolean) => {
    if (!checkInTask) return;

    if (!yes) {
      const t = checkInTask;
      setCheckInTask(null);
      return launchHelp(t);
    }

    setIsVerifying(true);

    try {
      if (checkInTask.category === TaskCategory.NETWORKING) {
        const names = prompt("Enter recruiter names (comma-separated):");
        if (!names) return;

        const verified = await requestNetworkingVerification(
          names.split(','),
          checkInTask
        );

        if (verified) completeTask(checkInTask.id);
        else {
          handleVerificationFail(checkInTask);
          launchHelp(checkInTask);
        }
      }

      else {
        await requestQuizFromBackend(checkInTask);
      }

    } catch (err) {
      console.error(err);
      alert("Verification failed.");
    }

    setIsVerifying(false);
    setCheckInTask(null);
  };


  /* -----------------------------------------------------------
     RENDER UI
  ----------------------------------------------------------- */
  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">

      <h1 className="text-3xl font-bold text-white mb-8">Task Progress</h1>

      {/* ACTIVE TASKS */}
      <div className="space-y-6">
        {activeTasks.length === 0 && (
          <div className="text-center py-16 text-gray-500 flex flex-col items-center">
            <CharacterIllustration
              character={userProfile.character}
              mood="Success"
              className="w-40 h-40 mb-4"
            />
            <p className="font-medium text-lg text-gray-300">No active tasks!</p>
            <p className="text-sm">Take a break — you earned it.</p>
          </div>
        )}

        {/* ACTIVE TASK LIST */}
        {activeTasks.map(task => (
          <div
            key={task.id}
            className={`bg-card border rounded-2xl ${
              task.status === TaskStatus.FAILED_VERIFICATION
                ? 'border-red-500/50'
                : 'border-gray-800'
            }`}
          >

            {/* TOP BAR */}
            <div
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              onClick={() => toggleExpand(task.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 w-3 h-3 rounded-full ${CATEGORY_COLORS[task.category]}`} />
                <div>
                  <h3 className="text-xl font-bold text-white">{task.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Due: {task.dueDate} at {task.dueTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    initiateCheckIn(task);
                  }}
                  className="bg-primary hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold"
                >
                  Check In
                </button>

                {expandedTaskId === task.id
                  ? <ChevronUp />
                  : <ChevronDown />}
              </div>
            </div>

            {/* EXPANDED SECTION */}
            {expandedTaskId === task.id && (
              <div className="bg-gray-900/50 border-t border-gray-800 p-6 space-y-6">

                {/* DESCRIPTION */}
                <div>
                  <h4 className="text-sm font-bold text-gray-400 mb-2">Description</h4>
                  <p className="text-gray-300">{task.description}</p>
                </div>

                {/* DEADLINE & ACTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* DEADLINE */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 mb-2">
                      Extend Deadline
                    </h4>
                    <div className="flex gap-2">
                      <button onClick={() => handleExtendDeadline(task.id, { hours: 1 })} className="px-3 py-1 bg-gray-800">+1 Hr</button>
                      <button onClick={() => handleExtendDeadline(task.id, { hours: 3 })} className="px-3 py-1 bg-gray-800">+3 Hrs</button>
                      <button onClick={() => handleExtendDeadline(task.id, { days: 1 })} className="px-3 py-1 bg-gray-800">+1 Day</button>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 mb-2">Actions</h4>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="flex items-center gap-2 px-3 py-1 bg-red-900/50 text-red-400 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete Task
                    </button>
                  </div>
                </div>

                {/* HELP */}
                <div className="flex items-center justify-between bg-gray-800/30 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-secondary w-5 h-5" />
                    <span className="text-sm text-gray-300">Need help? Let's do it together.</span>
                  </div>
                  <button
                    onClick={() => launchHelp(task)}
                    className="text-secondary font-bold text-sm flex items-center gap-1"
                  >
                    Let's do it <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* COMPLETED TASKS */}
      {completedTasks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-400 mb-4">Completed</h2>

          {completedTasks.map(task => (
            <div key={task.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-4 opacity-60">
              <CheckSquare className="text-green-500 w-6 h-6" />
              <span className="text-gray-400 line-through text-lg">{task.title}</span>
              <span className="ml-auto text-xs text-gray-600">
                {task.completedAt && new Date(task.completedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ------ MODALS ------ */}

      {/* CHECK-IN MODAL */}
      {checkInTask && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
            
            {isVerifying ? (
              <>
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Verifying...</h3>
                <p className="text-gray-400">Checking your work...</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Reality Check</h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Have you completed <span className="text-primary">"{checkInTask.title}"</span>?
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleCheckInResponse(false)}
                    className="py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    No, help me
                  </button>

                  <button
                    onClick={() => handleCheckInResponse(true)}
                    className="py-3 rounded-xl bg-primary hover:bg-indigo-600 text-white font-bold"
                  >
                    Yes
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* QUIZ MODAL */}
      <QuizModal
        isOpen={showQuiz}
        loading={quizLoading}
        questions={quizQuestions}
        character={userProfile.character}
        onComplete={(passed) => {
          const t =
            activeTasks.find(t => t.id === expandedTaskId) ||
            activeTasks[0];

          if (t) {
            if (passed) completeTask(t.id);
            else handleVerificationFail(t);
          }

          setShowQuiz(false);
        }}
        onRequestHelp={() => {
          const t =
            activeTasks.find(t => t.id === expandedTaskId) ||
            activeTasks[0];

          if (t) launchHelp(t);
          setShowQuiz(false);
        }}
      />

      {/* HELP MODAL */}
      <HelpModal
        isOpen={showHelp}
        loading={helpLoading}
        content={helpContent}
        character={userProfile.character}
        category={
          activeTasks.find(t => t.id === expandedTaskId)?.category ||
          TaskCategory.OTHER
        }
        onClose={() => setShowHelp(false)}
        onGenerateMore={() => {
          const t = activeTasks.find(t => t.id === expandedTaskId);
          if (t) launchHelp(t);
        }}
        onFinishedLearning={() => setShowHelp(false)}
      />

    </div>
  );
};
