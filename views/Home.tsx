import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, GripVertical, Clock, Calendar as CalendarIcon, Edit, ArrowRight, Play } from 'lucide-react';
import { Task, TaskStatus, UserProfile } from '../types';
import { TaskModal } from '../components/CreateTaskModal';
import { CATEGORY_COLORS } from '../constants';
import { CharacterIllustration } from '../components/Illustrations';

interface HomeProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  userProfile: UserProfile;
  setActiveTab: (tab: string) => void;
}

const columnConfig = {
  todo: { title: 'To Do', status: TaskStatus.TODO, color: 'bg-gray-500' },
  inProgress: { title: 'In Progress', status: TaskStatus.IN_PROGRESS, color: 'bg-primary' },
};

type ColumnId = keyof typeof columnConfig;

export const Home: React.FC<HomeProps> = ({ tasks, setTasks, userProfile, setActiveTab }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startColumnId = source.droppableId as ColumnId;
    const finishColumnId = destination.droppableId as ColumnId;

    const startStatus = columnConfig[startColumnId].status;
    const finishStatus = columnConfig[finishColumnId].status;

    // Reordering within the same column
    if (startColumnId === finishColumnId) {
      const columnTasks = tasks.filter(t => t.status === startStatus);
      const otherTasks = tasks.filter(t => t.status !== startStatus);
      
      const [removed] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, removed);
      
      setTasks([...columnTasks, ...otherTasks]);
    } else { // Moving to a different column
      const sourceTasks = tasks.filter(t => t.status === startStatus);
      const destTasks = tasks.filter(t => t.status === finishStatus);
      const otherTasks = tasks.filter(t => t.status !== startStatus && t.status !== finishStatus);

      const [removed] = sourceTasks.splice(source.index, 1);
      removed.status = finishStatus;
      destTasks.splice(destination.index, 0, removed);

      setTasks([...sourceTasks, ...destTasks, ...otherTasks]);
    }
  };

  const handleSaveTask = (taskData: any) => {
    if (taskData.id) {
      // Editing existing task
      setTasks(tasks.map(t => t.id === taskData.id ? { ...t, ...taskData } : t));
    } else {
      // Creating new task
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        order: tasks.length,
        verificationFailedCount: 0,
      };
      setTasks([...tasks, newTask]);
    }
  };

  const handleStartTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: TaskStatus.IN_PROGRESS } : t));
  };
  
  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const columns = {
    todo: tasks.filter(t => t.status === TaskStatus.TODO),
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS),
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Tasks</h1>
          <p className="text-gray-400">Drag tasks to change their status. Keep momentum.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-secondary hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-secondary/25 transition-all transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {(Object.keys(columns) as ColumnId[]).map(columnId => {
            const column = columnConfig[columnId];
            const columnTasks = columns[columnId];
            
            return (
              <div key={columnId} className="bg-card/50 rounded-2xl border border-gray-800 p-6 min-h-[500px] flex flex-col">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                      {column.title}
                    </h2>
                    <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs font-bold">{columnTasks.length}</span>
                 </div>

                 <Droppable droppableId={columnId}>
                   {(provided, snapshot) => (
                     <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef} 
                      className={`space-y-4 flex-1 rounded-lg p-2 transition-colors ${snapshot.isDraggingOver ? 'bg-primary/10' : 'bg-transparent'}`}
                    >
                      {columnTasks.length === 0 && (
                        <div className="text-center py-12 text-gray-500 flex flex-col items-center h-full justify-center">
                          <CharacterIllustration character={userProfile.character} mood="Idle" className="w-40 h-40 mb-4" />
                          <p className="font-medium">
                            {columnId === 'todo' ? "All clear!" : "No active tasks."}
                          </p>
                          <p className="text-sm">
                            {columnId === 'todo' ? "Create a new task to get started." : "Drag a task here to begin."}
                          </p>
                        </div>
                      )}
                       {columnTasks.map((task, index) => (
                         <Draggable key={task.id} draggableId={task.id} index={index}>
                           {(provided, snapshot) => (
                             <div
                               ref={provided.innerRef}
                               {...provided.draggableProps}
                               {...provided.dragHandleProps}
                               className={`bg-gray-800/80 p-5 rounded-xl border border-gray-700 hover:border-gray-500 transition-all group ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary rotate-2 z-50 bg-gray-800' : ''}`}
                             >
                               <div className="flex justify-between items-start mb-3">
                                 <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${CATEGORY_COLORS[task.category]}`}>
                                   {task.category}
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <button onClick={() => openEditModal(task)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity">
                                      <Edit className="w-4 h-4" />
                                   </button>
                                   <GripVertical className="text-gray-600 group-hover:text-gray-400 cursor-grab" />
                                 </div>
                               </div>
                               <h3 className="text-lg font-medium text-white mb-2">{task.title}</h3>
                               <p className="text-gray-400 text-sm line-clamp-2 mb-4">{task.description}</p>
                               
                               <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-700 pt-3">
                                  <div className="flex items-center gap-1.5">
                                    <CalendarIcon className="w-3.5 h-3.5" /> {task.dueDate}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> {task.dueTime}
                                  </div>
                               </div>
                               
                               {task.status === TaskStatus.TODO && (
                                 <button 
                                  onClick={() => handleStartTask(task.id)}
                                  className="w-full mt-4 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                 >
                                   Start Task <Play className="w-4 h-4 fill-current" />
                                 </button>
                               )}

                               {task.status === TaskStatus.IN_PROGRESS && (
                                 <button 
                                  onClick={() => setActiveTab('progress')}
                                  className="w-full mt-4 py-2.5 bg-primary/80 hover:bg-primary text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                 >
                                   Check In <ArrowRight className="w-4 h-4" />
                                 </button>
                               )}
                             </div>
                           )}
                         </Draggable>
                       ))}
                       {provided.placeholder}
                     </div>
                   )}
                 </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveTask} 
        taskToEdit={editingTask}
      />
    </div>
  );
};