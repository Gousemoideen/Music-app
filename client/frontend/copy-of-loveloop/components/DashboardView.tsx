import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, CheckCircle, Circle, Calendar } from 'lucide-react';
import { getTodayDateString } from '../lib/utils';

interface DashboardViewProps {
  tasks: Task[];
  onAddTask: (title: string) => void;
  onToggleTask: (task: Task) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, onAddTask, onToggleTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const today = getTodayDateString();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle('');
    }
  };

  // Logic: Tasks are "completed today" if completed=true AND lastCompletionDate=today.
  // Otherwise they are shown as todo.
  const isCompletedToday = (task: Task) => task.completed && task.lastCompletionDate === today;

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort: Incomplete first, then completed
    const aDone = isCompletedToday(a);
    const bDone = isCompletedToday(b);
    if (aDone === bDone) return b.createdAt - a.createdAt;
    return aDone ? 1 : -1;
  });

  return (
    <div className="space-y-8 animate-pop">
      {/* Add New Goal */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
        <h2 className="text-lg font-bold text-rose-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-rose-400" />
          New Goal
        </h2>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What do you want to achieve, love?"
            className="flex-1 px-4 py-3 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-900 placeholder:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center aspect-square"
          >
            <Plus className="w-6 h-6" />
          </button>
        </form>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="text-rose-900/60 font-semibold px-2 text-sm uppercase tracking-wider">Today's Goals</h3>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-10 text-rose-300 italic">
            No goals yet. Add one above! ✨
          </div>
        ) : (
          sortedTasks.map((task) => {
            const completed = isCompletedToday(task);
            return (
              <div
                key={task.id}
                onClick={() => onToggleTask(task)}
                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer select-none ${
                  completed
                    ? 'bg-rose-100/50 border-rose-200 opacity-80'
                    : 'bg-white border-rose-100 hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`transition-colors duration-300 ${completed ? 'text-rose-500' : 'text-rose-200 group-hover:text-rose-300'}`}>
                    {completed ? <CheckCircle className="w-7 h-7 fill-rose-100" /> : <Circle className="w-7 h-7" />}
                  </div>
                  <span className={`text-lg font-medium transition-all duration-300 ${completed ? 'text-rose-400 line-through decoration-rose-300' : 'text-rose-800'}`}>
                    {task.title}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DashboardView;
