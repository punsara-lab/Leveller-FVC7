import { useState, useEffect } from 'react';
import { BookOpen, Plus, Minus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
  icon: string;
  chapters: number;
  totalChapters: number;
  hours: number;
  mcqs: number;
  color: string;
}

interface StudyTrackerProps {
  onHoursChange: (totalHours: number) => void;
}

const StudyTracker = ({ onHoursChange }: StudyTrackerProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'physics', name: 'Physics', icon: '⚡', chapters: 0, totalChapters: 15, hours: 0, mcqs: 0, color: 'bg-blue-500' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', chapters: 0, totalChapters: 18, hours: 0, mcqs: 0, color: 'bg-green-500' },
    { id: 'biology', name: 'Biology', icon: '🧬', chapters: 0, totalChapters: 20, hours: 0, mcqs: 0, color: 'bg-purple-500' },
  ]);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('rx1_study_tracker_v2');
    if (saved) {
      setSubjects(JSON.parse(saved));
    }
  }, []);

  // Save data and update total hours
  useEffect(() => {
    localStorage.setItem('rx1_study_tracker_v2', JSON.stringify(subjects));
    const totalHours = subjects.reduce((sum, s) => sum + s.hours, 0);
    onHoursChange(totalHours);
  }, [subjects, onHoursChange]);

  const updateSubject = (id: string, field: 'chapters' | 'hours' | 'mcqs', delta: number) => {
    setSubjects(subjects.map(s => {
      if (s.id !== id) return s;
      
      if (field === 'chapters') {
        return { ...s, chapters: Math.max(0, Math.min(s.chapters + delta, s.totalChapters)) };
      } else if (field === 'hours') {
        return { ...s, hours: Math.max(0, s.hours + delta) };
      } else {
        return { ...s, mcqs: Math.max(0, s.mcqs + delta) };
      }
    }));
  };

  const totalProgress = Math.round(
    (subjects.reduce((sum, s) => sum + s.chapters, 0) / 
     subjects.reduce((sum, s) => sum + s.totalChapters, 0)) * 100
  );

  const totalMCQs = subjects.reduce((sum, s) => sum + s.mcqs, 0);
  const totalStudyHours = subjects.reduce((sum, s) => sum + s.hours, 0);

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Study Tracker
        </h3>
        <div className="text-sm">
          <span className="text-muted-foreground">Progress:</span>
          <span className="font-bold text-primary ml-1">{totalProgress}%</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-muted/20 border border-primary/10 text-center">
          <div className="text-xs text-muted-foreground">Total Hours</div>
          <div className="text-lg font-bold text-primary">{totalStudyHours}h</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/20 border border-primary/10 text-center">
          <div className="text-xs text-muted-foreground">MCQs Done</div>
          <div className="text-lg font-bold text-green-400">{totalMCQs}</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/20 border border-primary/10 text-center">
          <div className="text-xs text-muted-foreground">Chapters</div>
          <div className="text-lg font-bold text-accent">
            {subjects.reduce((sum, s) => sum + s.chapters, 0)}/{subjects.reduce((sum, s) => sum + s.totalChapters, 0)}
          </div>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-3">
        {subjects.map((subject) => {
          const progress = Math.round((subject.chapters / subject.totalChapters) * 100);
          return (
            <div
              key={subject.id}
              className="p-3 rounded-xl bg-muted/20 border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{subject.icon}</span>
                  <span className="font-medium text-foreground">{subject.name}</span>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  progress >= 100 ? "bg-green-500/20 text-green-400" :
                  progress >= 50 ? "bg-primary/20 text-primary" :
                  "bg-muted/30 text-muted-foreground"
                )}>
                  {progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden mb-3">
                <div 
                  className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", subject.color)}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* Chapters */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-muted-foreground">Chapters</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSubject(subject.id, 'chapters', -1)}
                      className="w-5 h-5 rounded bg-muted/30 hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-foreground w-8 text-center">
                      {subject.chapters}
                    </span>
                    <button
                      onClick={() => updateSubject(subject.id, 'chapters', 1)}
                      className="w-5 h-5 rounded bg-muted/30 hover:bg-green-500/20 flex items-center justify-center text-muted-foreground hover:text-green-400 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-muted-foreground">Hours</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSubject(subject.id, 'hours', -0.5)}
                      className="w-5 h-5 rounded bg-muted/30 hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-foreground w-6 text-center">
                      {subject.hours}
                    </span>
                    <button
                      onClick={() => updateSubject(subject.id, 'hours', 0.5)}
                      className="w-5 h-5 rounded bg-muted/30 hover:bg-green-500/20 flex items-center justify-center text-muted-foreground hover:text-green-400 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* MCQs */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-muted-foreground">MCQs</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateSubject(subject.id, 'mcqs', -10)}
                      className="w-5 h-5 rounded bg-muted/30 hover:bg-destructive/20 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-foreground w-8 text-center">
                      {subject.mcqs}
                    </span>
                    <button
                      onClick={() => updateSubject(subject.id, 'mcqs', 10)}
                      className="w-5 h-5 rounded bg-muted/30 hover:bg-green-500/20 flex items-center justify-center text-muted-foreground hover:text-green-400 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudyTracker;
