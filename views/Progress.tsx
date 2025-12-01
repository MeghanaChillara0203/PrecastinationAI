import React, { useState } from 'react';
import { Clock, AlertCircle, CheckSquare, ChevronDown, ChevronUp, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { format, addHours, addDays } from 'date-fns';
import { Task, TaskStatus, AIAccessLevel, TaskCategory, UserProfile } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { generateQuizForTask, getHelpForTask, verifyNetworkingNames } from '../services/geminiService';
import { QuizModal } from '../components/AI/QuizModal';
import { HelpModal } from '../components/AI/HelpModal';
import { CharacterIllustration } from '../components/Illustrations';

interface ProgressProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  userProfile: UserProfile;
}

export const Progress: React.FC<ProgressProps> = ({ tasks, setTasks, userProfile }) => {
  const activeTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.FAILED_VERIFICATION);
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
  
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  const [checkInTask, setCheckInTask] = useState<Task | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);

  const [helpLoading, setHelpLoading] = useState(false);
  const [helpContent, setHelpContent] = useState<any>(null);
  const [showHelp, setShowHelp] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const handleExtendDeadline = (taskId: string, duration: { hours?: number, days?: number }) => {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      
      const currentDateTime = new Date(`${t.dueDate}T${t.dueTime}`);
      let newDate;
      if (duration.hours) {
        newDate = addHours(currentDateTime, duration.hours);
      } else if (duration.days) {
        newDate = addDays(currentDateTime, duration.days);
      } else {
        return t;
      }
      
      return {
        ...t,
        dueDate: format(newDate, 'yyyy-MM-dd'),
        dueTime: format(newDate, 'HH:mm'),
      };
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task permanently?")) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const initiateCheckIn = (task: Task) => {
    setCheckInTask(task);
  };

  const handleCheckInResponse = async (yes: boolean) => {
    if (!checkInTask) return;

    if (yes) {
      setIsVerifying(true);
      try {
        if (checkInTask.aiAccess === AIAccessLevel.STATUS_ONLY) {
          completeTask(checkInTask.id);
        } else if (checkInTask.category === TaskCategory.NETWORKING) {
          const names = prompt("Enter the names of the recruiters you contacted (comma separated):");
          if (names) {
             setCheckInTask(null);
             setIsVerifying(true);
             const verified = await verifyNetworkingNames(names.split(','), checkInTask);
             
             if (verified) {
               completeTask(checkInTask.id);
               alert("Verification Successful: Profiles match criteria.");
             } else {
               handleVerificationFail(checkInTask);
               launchHelp(checkInTask);
             }
          }
        } else {
          let contextUrl = undefined;
          if (checkInTask.category === TaskCategory.RESEARCH) {
            const url = prompt("Please paste the URL of the paper/video you studied:");
            if (url) contextUrl = url;
            else {
                setIsVerifying(false);
                setCheckInTask(null);
                return;
            }
          }
          setCheckInTask(null);
          setQuizLoading(true);
          const questions = await generateQuizForTask(checkInTask, contextUrl);
          setQuizQuestions(questions);
          setShowQuiz(true);
        }
      } catch (e) {
        console.error("Verification error", e);
        alert("Something went wrong during verification.");
      } finally {
        setIsVerifying(false);
        setQuizLoading(false);
      }
    } else {
      const task = checkInTask;
      setCheckInTask(null);
      launchHelp(task);
    }
  };

  const handleVerificationFail = (task?: Task) => {
    const taskToFail = task || checkInTask || (expandedTaskId ? tasks.find(t => t.id === expandedTaskId) : null);
    if(taskToFail) {
        setTasks(prev => prev.map(t => t.id === taskToFail.id ? { ...t, status: TaskStatus.FAILED_VERIFICATION, verificationFailedCount: t.verificationFailedCount + 1 } : t));
    }
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: TaskStatus.COMPLETED, completedAt: new Date().toISOString() } : t));
    setShowQuiz(false);
    setCheckInTask(null);
  };

  const launchHelp = async (task: Task) => {
    setExpandedTaskId(task.id);
    setHelpLoading(true);
    setShowHelp(true);
    const content = await getHelpForTask(task, userProfile);
    setHelpContent(content);
    setHelpLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-white mb-8">Task Progress</h1>

      <div className="space-y-6">
        {activeTasks.length === 0 && (
            <div className="text-center py-16 text-gray-500 flex flex-col items-center">
                <CharacterIllustration character={userProfile.character} mood="Success" className="w-40 h-40 mb-4" />
                <p className="font-medium text-lg text-gray-300">No active tasks!</p>
                <p className="text-sm">Time for a well-deserved break.</p>
            </div>
        )}
        
        {activeTasks.map(task => (
          <div key={task.id} className={`bg-card border ${task.status === TaskStatus.FAILED_VERIFICATION ? 'border-red-500/50' : 'border-gray-800'} rounded-2xl overflow-hidden transition-all`}>
            
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer" onClick={() => toggleExpand(task.id)}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 w-3 h-3 rounded-full ${CATEGORY_COLORS[task.category]}`}></div>
                <div>
                  <h3 className="text-xl font-bold text-white">{task.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                     <Clock className="w-4 h-4" /> Due: {task.dueDate} at {task.dueTime}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                 {task.status === TaskStatus.FAILED_VERIFICATION && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">Failed</span>
                    <CharacterIllustration character={userProfile.character} mood="Failure" className="w-10 h-10" />
                  </div>
                 )}
                 <button 
                  onClick={(e) => { e.stopPropagation(); initiateCheckIn(task); }}
                  className="bg-primary hover:bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-primary/20"
                 >
                   Check In
                 </button>
                 {expandedTaskId === task.id ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
              </div>
            </div>

            {expandedTaskId === task.id && (
              <div className="bg-gray-900/50 border-t border-gray-800 p-6 animate-slide-up space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-gray-300 leading-relaxed">{task.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Extend Deadline</h4>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleExtendDeadline(task.id, { hours: 1 })} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium border border-gray-700 transition-colors">+1 Hr</button>
                      <button onClick={() => handleExtendDeadline(task.id, { hours: 3 })} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium border border-gray-700 transition-colors">+3 Hrs</button>
                      <button onClick={() => handleExtendDeadline(task.id, { days: 1 })} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-medium border border-gray-700 transition-colors">+1 Day</button>
                    </div>
                  </div>
                   <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Actions</h4>
                    <button onClick={() => handleDeleteTask(task.id)} className="flex items-center gap-2 px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-400 rounded text-xs font-medium border border-red-500/20 transition-colors">
                      <Trash2 className="w-3 h-3" /> Delete Task
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3">
                     <AlertCircle className="text-secondary w-5 h-5" />
                     <span className="text-sm text-gray-300">Stuck? Wanna do it together? I've been waiting for you.</span>
                  </div>
                  <button 
                    onClick={() => launchHelp(task)}
                    className="text-secondary hover:text-pink-400 font-bold text-sm flex items-center gap-1"
                  >
                    Let's do it <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {completedTasks.length > 0 && (
        <div className="mt-12">
           <h2 className="text-xl font-bold text-gray-400 mb-4">Completed</h2>
           <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity">
             {completedTasks.map(task => (
               <div key={task.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                 <CheckSquare className="text-green-500 w-6 h-6" />
                 <span className="text-gray-400 line-through text-lg">{task.title}</span>
                 <span className="ml-auto text-xs text-gray-600">{task.completedAt && new Date(task.completedAt).toLocaleDateString()}</span>
               </div>
             ))}
           </div>
        </div>
      )}

      {checkInTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fade-in">
            { isVerifying ? (
              <>
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Verifying...</h3>
                <p className="text-gray-400">Checking your work...</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Reality Check</h2>
                <p className="text-gray-300 mb-8 text-lg">Have you completed <span className="text-primary font-bold">"{checkInTask.title}"</span>?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleCheckInResponse(false)} className="py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 font-semibold transition-all">No, help me</button>
                  <button onClick={() => handleCheckInResponse(true)} className="py-3 rounded-xl bg-primary hover:bg-indigo-600 text-white font-bold shadow-lg shadow-primary/25 transition-all">Yes</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <QuizModal 
        isOpen={showQuiz}
        loading={quizLoading}
        questions={quizQuestions}
        character={userProfile.character}
        onComplete={(passed) => {
           const targetTask = activeTasks.find(t => t.id === expandedTaskId) || checkInTask || activeTasks[0];
           if (targetTask) {
             if (passed) {
               completeTask(targetTask.id);
             } else {
               handleVerificationFail(targetTask);
             }
           }
           setShowQuiz(false);
        }}
        onRequestHelp={() => {
            const targetTask = activeTasks.find(t => t.id === expandedTaskId) || activeTasks[0];
            if (targetTask) {
                handleVerificationFail(targetTask);
                launchHelp(targetTask);
            }
            setShowQuiz(false);
        }}
      />

      <HelpModal
        isOpen={showHelp}
        loading={helpLoading}
        content={helpContent}
        character={userProfile.character}
        category={activeTasks.find(t=>t.id === expandedTaskId)?.category || TaskCategory.OTHER} 
        onClose={() => setShowHelp(false)}
        onGenerateMore={() => {
             const task = activeTasks.find(t => t.id === expandedTaskId) || activeTasks[0];
             if(task) launchHelp(task);
        }}
        onFinishedLearning={() => {
            setShowHelp(false);
            const task = activeTasks.find(t => t.id === expandedTaskId) || activeTasks[0];
            if(task) initiateCheckIn(task);
        }}
      />
    </div>
  );
};