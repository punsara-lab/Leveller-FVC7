import { useState } from 'react';
import { Plus, Check, X, Circle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  category: 'study' | 'training' | 'fitness' | 'mindset' | 'project';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
}

interface TaskManagerProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

const categoryColors = {
  study: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  training: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  fitness: 'bg-green-500/20 text-green-400 border-green-500/30',
  mindset: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  project: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const statusIcons = {
  pending: Circle,
  'in-progress': Clock,
  completed: Check,
  failed: X,
};

const statusColors = {
  pending: 'text-muted-foreground',
  'in-progress': 'text-yellow-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
};

const TaskManager = ({ tasks, onTasksChange }: TaskManagerProps) => {
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Task['category']>('study');

  const addTask = () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      category: selectedCategory,
      status: 'pending',
      createdAt: new Date(),
    };
    
    onTasksChange([...tasks, task]);
    setNewTask('');
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    onTasksChange(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  const categories: Task['category'][] = ['study', 'training', 'fitness', 'mindset', 'project'];

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-primary" />
        Task Manager
      </h3>

      {/* Add Task Form */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add new task..."
            className="flex-1 bg-muted/30 border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={addTask}
            className="p-2.5 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-xl transition-colors text-primary"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium capitalize border transition-all",
                selectedCategory === cat
                  ? categoryColors[cat]
                  : "bg-muted/20 text-muted-foreground border-transparent hover:border-primary/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks yet. Add your first task above!
          </div>
        ) : (
          tasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all group",
                  task.status === 'completed' 
                    ? "bg-green-500/5 border-green-500/20" 
                    : task.status === 'failed'
                    ? "bg-red-500/5 border-red-500/20"
                    : task.status === 'in-progress'
                    ? "bg-yellow-500/5 border-yellow-500/20"
                    : "bg-muted/10 border-primary/10 hover:border-primary/30"
                )}
              >
                {/* Status Button */}
                <button
                  onClick={() => {
                    const statusCycle: Task['status'][] = ['pending', 'in-progress', 'completed', 'failed'];
                    const currentIndex = statusCycle.indexOf(task.status);
                    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
                    updateTaskStatus(task.id, nextStatus);
                  }}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    statusColors[task.status]
                  )}
                >
                  <StatusIcon className="w-4 h-4" />
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    task.status === 'completed' && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                </div>

                {/* Category Badge */}
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-xs font-medium border capitalize",
                  categoryColors[task.category]
                )}>
                  {task.category}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskManager;
