import { useState, useEffect } from 'react';
import { Dumbbell, Minus, Plus, TrendingUp, Swords } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays } from 'date-fns';

interface TrainingData {
  pushUps: number;
  sitUps: number;
  pullUps: number;
  squats: number;
  runKm: number;
  martialArts: boolean;
}

interface DailyTrainingLog {
  date: string;
  total: number;
  pushUps: number;
  sitUps: number;
  pullUps: number;
  squats: number;
  runKm: number;
  martialArts: boolean;
}

interface TrainingModuleProps {
  data: TrainingData;
  onDataChange: (data: TrainingData) => void;
}

const TrainingModule = ({ data, onDataChange }: TrainingModuleProps) => {
  const [weeklyData, setWeeklyData] = useState<{ day: string; total: number; date: string }[]>([]);

  // Load and calculate real weekly data from logs
  useEffect(() => {
    const logs: DailyTrainingLog[] = JSON.parse(localStorage.getItem('rx1_training_logs') || '[]');
    
    // Generate last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLog = logs.find(l => l.date === dateStr);
      
      last7Days.push({
        day: format(date, 'EEE'),
        date: dateStr,
        total: dayLog ? dayLog.total : 0,
      });
    }
    
    setWeeklyData(last7Days);
  }, [data]);

  // Save today's training when data changes
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const logs: DailyTrainingLog[] = JSON.parse(localStorage.getItem('rx1_training_logs') || '[]');
    
    const total = data.pushUps + data.sitUps + data.pullUps + data.squats + (data.runKm * 10) + (data.martialArts ? 20 : 0);
    
    const todayLog: DailyTrainingLog = {
      date: today,
      total,
      ...data,
    };
    
    // Update or add today's log
    const existingIndex = logs.findIndex(l => l.date === today);
    if (existingIndex >= 0) {
      logs[existingIndex] = todayLog;
    } else {
      logs.push(todayLog);
    }
    
    // Keep only last 30 days
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const filteredLogs = logs.filter(l => l.date >= thirtyDaysAgo);
    
    localStorage.setItem('rx1_training_logs', JSON.stringify(filteredLogs));
  }, [data]);

  const exercises = [
    { key: 'pushUps' as keyof TrainingData, label: 'Push-ups', icon: '💪', color: 'from-orange-500 to-red-500', step: 5 },
    { key: 'sitUps' as keyof TrainingData, label: 'Sit-ups', icon: '🔥', color: 'from-yellow-500 to-orange-500', step: 5 },
    { key: 'pullUps' as keyof TrainingData, label: 'Pull-ups', icon: '🏋️', color: 'from-blue-500 to-cyan-500', step: 1 },
    { key: 'squats' as keyof TrainingData, label: 'Squats', icon: '🦵', color: 'from-purple-500 to-pink-500', step: 5 },
    { key: 'runKm' as keyof TrainingData, label: 'Run (km)', icon: '🏃', color: 'from-green-500 to-emerald-500', step: 0.5 },
  ];

  const updateValue = (key: keyof TrainingData, delta: number) => {
    if (key === 'martialArts') return;
    const currentValue = data[key] as number;
    const newValue = Math.max(0, currentValue + delta);
    onDataChange({ ...data, [key]: newValue });
  };

  const toggleMartialArts = () => {
    onDataChange({ ...data, martialArts: !data.martialArts });
  };

  const totalToday = data.pushUps + data.sitUps + data.pullUps + data.squats + (data.runKm * 10) + (data.martialArts ? 20 : 0);
  const weekTotal = weeklyData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          Training Module
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-muted-foreground">Today:</span>
          <span className="font-bold text-foreground">{totalToday}</span>
        </div>
      </div>

      {/* Exercise Counters */}
      <div className="space-y-2 mb-4">
        {exercises.map(({ key, label, icon, color, step }) => (
          <div
            key={key}
            className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-primary/10 group hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateValue(key, -step)}
                className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-destructive/20 flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive"
              >
                <Minus className="w-3 h-3" />
              </button>
              
              <div className={`w-14 text-center py-1 rounded-lg bg-gradient-to-r ${color} text-white font-bold text-sm`}>
                {key === 'runKm' ? (data[key] as number).toFixed(1) : data[key]}
              </div>
              
              <button
                onClick={() => updateValue(key, step)}
                className="w-7 h-7 rounded-lg bg-muted/30 hover:bg-green-500/20 flex items-center justify-center transition-colors text-muted-foreground hover:text-green-400"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Martial Arts Toggle */}
        <div
          onClick={toggleMartialArts}
          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
            data.martialArts 
              ? 'bg-orange-500/20 border-orange-500/50' 
              : 'bg-muted/20 border-primary/10 hover:border-primary/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <Swords className={`w-5 h-5 ${data.martialArts ? 'text-orange-400' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium text-foreground">Martial Arts</span>
          </div>
          <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
            data.martialArts 
              ? 'bg-orange-500 text-white' 
              : 'bg-muted/30 text-muted-foreground'
          }`}>
            {data.martialArts ? 'DONE' : 'NOT YET'}
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Weekly Progress</span>
          <span className="text-xs font-bold text-primary">Total: {weekTotal}</span>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="trainingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--primary) / 0.2)',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#trainingGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TrainingModule;
