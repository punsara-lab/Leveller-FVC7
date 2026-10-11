import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Calendar, Target } from 'lucide-react';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

interface AnalyticsPanelProps {
  studyHours: number;
  trainingData: {
    pushUps: number;
    sitUps: number;
    pullUps: number;
    squats: number;
    runKm: number;
    martialArts: boolean;
  };
}

interface DailyLog {
  date: string;
  studyHours: number;
  mcqs: number;
  trainingScore: number;
}

const AnalyticsPanel = ({ studyHours, trainingData }: AnalyticsPanelProps) => {
  const [weeklyStudy, setWeeklyStudy] = useState<{ day: string; hours: number; mcqs: number }[]>([]);
  const [subjectDistribution, setSubjectDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

  // Load and calculate real analytics from localStorage
  useEffect(() => {
    // Get study tracker data
    const studyData = JSON.parse(localStorage.getItem('rx1_study_tracker_v2') || '[]');
    const trainingLogs = JSON.parse(localStorage.getItem('rx1_training_logs') || '[]');
    const dailyLogs: DailyLog[] = JSON.parse(localStorage.getItem('rx1_daily_logs') || '[]');

    // Generate last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const log = dailyLogs.find(l => l.date === dateStr);
      
      last7Days.push({
        day: format(date, 'EEE'),
        hours: log?.studyHours || 0,
        mcqs: log?.mcqs || 0,
      });
    }
    setWeeklyStudy(last7Days);

    // Calculate subject distribution from current data
    if (studyData.length > 0) {
      const distribution = studyData.map((s: any) => ({
        name: s.name,
        value: s.hours || 1,
        color: s.id === 'physics' ? '#3b82f6' : s.id === 'chemistry' ? '#22c55e' : '#a855f7',
      }));
      setSubjectDistribution(distribution);
    } else {
      setSubjectDistribution([
        { name: 'Physics', value: 1, color: '#3b82f6' },
        { name: 'Chemistry', value: 1, color: '#22c55e' },
        { name: 'Biology', value: 1, color: '#a855f7' },
      ]);
    }

    // Save today's log
    const today = format(new Date(), 'yyyy-MM-dd');
    const trainingScore = trainingData.pushUps + trainingData.sitUps + trainingData.pullUps + 
                          trainingData.squats + (trainingData.runKm * 10) + (trainingData.martialArts ? 20 : 0);
    
    const todayLog: DailyLog = {
      date: today,
      studyHours,
      mcqs: studyData.reduce((sum: number, s: any) => sum + (s.mcqs || 0), 0),
      trainingScore,
    };

    const existingIndex = dailyLogs.findIndex(l => l.date === today);
    if (existingIndex >= 0) {
      dailyLogs[existingIndex] = todayLog;
    } else {
      dailyLogs.push(todayLog);
    }

    // Keep only last 30 days
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const filteredLogs = dailyLogs.filter(l => l.date >= thirtyDaysAgo);
    localStorage.setItem('rx1_daily_logs', JSON.stringify(filteredLogs));

  }, [studyHours, trainingData]);

  const totalWeeklyHours = weeklyStudy.reduce((sum, d) => sum + d.hours, 0);
  const totalWeeklyMCQs = weeklyStudy.reduce((sum, d) => sum + d.mcqs, 0);
  const avgDailyHours = totalWeeklyHours / 7;

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Real-Time Analytics
        </h3>
        <div className="flex items-center gap-1 text-xs">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Last 7 days</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-muted/20 border border-primary/10 text-center">
          <div className="text-[10px] text-muted-foreground">Week Hours</div>
          <div className="text-lg font-bold text-primary">{totalWeeklyHours.toFixed(1)}</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/20 border border-primary/10 text-center">
          <div className="text-[10px] text-muted-foreground">Week MCQs</div>
          <div className="text-lg font-bold text-green-400">{totalWeeklyMCQs}</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/20 border border-primary/10 text-center">
          <div className="text-[10px] text-muted-foreground">Avg/Day</div>
          <div className="text-lg font-bold text-accent">{avgDailyHours.toFixed(1)}h</div>
        </div>
      </div>

      {/* Study Hours Bar Chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Daily Study Hours</span>
          <TrendingUp className="w-3 h-3 text-green-400" />
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStudy}>
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
                  fontSize: '10px',
                }}
              />
              <Bar 
                dataKey="hours" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Distribution */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Subject Distribution</span>
          <Target className="w-3 h-3 text-accent" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={35}
                  strokeWidth={0}
                >
                  {subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1">
            {subjectDistribution.map((subject) => (
              <div key={subject.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="text-muted-foreground">{subject.name}</span>
                </div>
                <span className="font-medium text-foreground">{subject.value}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
