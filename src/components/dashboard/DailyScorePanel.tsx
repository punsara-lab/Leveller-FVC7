import { useState, useEffect } from 'react';
import { Flame, CheckCircle, Clock, Trophy, Zap, TrendingUp } from 'lucide-react';
import { getPlayerProgress, PlayerProgress } from '@/utils/levelSystem';

interface DailyScorePanelProps {
  tasks: { status: string }[];
  trainingData: {
    pushUps: number;
    sitUps: number;
    pullUps: number;
    squats: number;
    runKm: number;
    martialArts?: boolean;
  };
  studyHours: number;
}

const DailyScorePanel = ({ tasks, trainingData, studyHours }: DailyScorePanelProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null);
  
  // Load player progress
  useEffect(() => {
    const progress = getPlayerProgress();
    setPlayerProgress(progress);
  }, []);
  
  // Calculate overall score
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskScore = tasks.length > 0 ? (completedTasks / tasks.length) * 25 : 0;
  
  const trainingTotal = trainingData.pushUps + trainingData.sitUps + trainingData.pullUps + trainingData.squats + (trainingData.runKm * 10) + (trainingData.martialArts ? 20 : 0);
  const trainingScore = Math.min(25, (trainingTotal / 100) * 25);
  
  const studyScore = Math.min(25, (studyHours / 4) * 25);
  
  // Get streak from localStorage
  const [streak, setStreak] = useState(0);
  
  useEffect(() => {
    const savedStreak = localStorage.getItem('rx1_streak');
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
  }, []);
  
  const streakScore = Math.min(25, streak * 2.5);
  
  const totalScore = Math.round(taskScore + trainingScore + studyScore + streakScore);
  
  // Animate score
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedScore(prev => {
        if (prev < totalScore) {
          return Math.min(prev + 1, totalScore);
        }
        return prev;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [totalScore]);

  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-yellow-400';
    return 'text-destructive';
  };

  const currentLevel = playerProgress?.level || 1;
  const consecutiveDays = playerProgress?.consecutiveDays || 0;

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Daily Performance
        </h3>
        {/* Level Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
          <Zap className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-bold text-primary">LVL {currentLevel}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        {/* Circular Progress */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r="64"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <circle
              cx="72"
              cy="72"
              r="64"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 64}
              strokeDashoffset={(2 * Math.PI * 64) - (animatedScore / 100) * (2 * Math.PI * 64)}
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(animatedScore)}`}>
              {animatedScore}%
            </span>
            <span className="text-[10px] text-muted-foreground">DISCIPLINE</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/20 rounded-xl p-2 border border-primary/10">
          <div className="flex items-center gap-1 mb-0.5">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-muted-foreground">Tasks</span>
          </div>
          <div className="text-base font-bold text-foreground">
            {completedTasks}/{tasks.length}
          </div>
        </div>
        
        <div className="bg-muted/20 rounded-xl p-2 border border-primary/10">
          <div className="flex items-center gap-1 mb-0.5">
            <Clock className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground">Focus</span>
          </div>
          <div className="text-base font-bold text-foreground">
            {studyHours}h
          </div>
        </div>
        
        <div className="bg-muted/20 rounded-xl p-2 border border-primary/10">
          <div className="flex items-center gap-1 mb-0.5">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-[10px] text-muted-foreground">Streak</span>
          </div>
          <div className="text-base font-bold text-foreground">
            {streak} Days 🔥
          </div>
        </div>
        
        <div className="bg-muted/20 rounded-xl p-2 border border-primary/10">
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingUp className="w-3 h-3 text-accent" />
            <span className="text-[10px] text-muted-foreground">Consecutive</span>
          </div>
          <div className="text-base font-bold text-foreground">
            {consecutiveDays} Days
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyScorePanel;
