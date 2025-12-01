import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  tasks: Task[];
  setActiveTab: (tab: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ tasks, setActiveTab }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleTaskClick = (task: Task) => {
    if (task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.FAILED_VERIFICATION) {
      setActiveTab('progress');
    } else {
      setActiveTab('home');
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Calendar</h1>
        <div className="flex items-center gap-4">
            <button 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-xl font-medium text-primary w-40 text-center select-none">
                {format(currentDate, 'MMMM yyyy')}
            </div>
            <button 
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
      </header>

      <div className="flex-1 bg-card border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-900/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-4 text-center text-sm font-bold text-gray-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-gray-900/20">
          {days.map((day, idx) => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate), day));
            const isToday = isSameDay(day, new Date());

            return (
              <div 
                key={idx} 
                className={`border-b border-r border-gray-800 p-2 min-h-[100px] relative hover:bg-gray-800/30 transition-colors group ${
                   !isSameMonth(day, currentDate) ? 'bg-gray-900/50 text-gray-700' : 'text-gray-300'
                }`}
              >
                <span className={`text-sm font-medium p-1 rounded-full w-8 h-8 flex items-center justify-center ${
                  isToday ? 'bg-primary text-white shadow-lg shadow-primary/50' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {format(day, 'd')}
                </span>
                
                <div className="mt-2 space-y-1 overflow-y-auto max-h-24 custom-scrollbar">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                      className={`text-xs px-2 py-1.5 rounded-md truncate text-white ${CATEGORY_COLORS[task.category]} shadow-sm cursor-pointer hover:opacity-80 transition-opacity`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};