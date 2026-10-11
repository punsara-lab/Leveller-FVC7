import { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, Award } from 'lucide-react';

interface WeeklyReviewProps {
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

const WeeklyReview = ({ tasks, trainingData, studyHours }: WeeklyReviewProps) => {
  const [weeklyStats, setWeeklyStats] = useState({
    discipline: 0,
    consistency: 0,
    focus: 0,
    productivity: 0,
    health: 0,
    sleep: 7, // Default sleep hours
  });

  useEffect(() => {
    // Calculate scores based on inputs
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length || 1;
    
    const trainingTotal = trainingData.pushUps + trainingData.sitUps + 
                          trainingData.pullUps + trainingData.squats + 
                          (trainingData.runKm * 10) + (trainingData.martialArts ? 20 : 0);

    // Calculate each metric (0-100 scale)
    const discipline = Math.min(100, (completedTasks / totalTasks) * 100);
    const consistency = Math.min(100, (studyHours / 4) * 100); // 4 hours = 100%
    const focus = Math.min(100, studyHours * 15); // More hours = more focus
    const productivity = Math.min(100, (completedTasks * 15) + (studyHours * 10));
    const health = Math.min(100, trainingTotal); // Training score
    
    // Load sleep from localStorage
    const savedSleep = localStorage.getItem('rx1_sleep_hours');
    const sleep = savedSleep ? parseInt(savedSleep) : 7;

    setWeeklyStats({
      discipline: Math.round(discipline),
      consistency: Math.round(consistency),
      focus: Math.round(focus),
      productivity: Math.round(productivity),
      health: Math.round(health),
      sleep: Math.min(100, sleep * 12.5), // 8 hours = 100%
    });
  }, [tasks, trainingData, studyHours]);

  const radarData = [
    { skill: 'Discipline', value: weeklyStats.discipline, fullMark: 100 },
    { skill: 'Consistency', value: weeklyStats.consistency, fullMark: 100 },
    { skill: 'Focus', value: weeklyStats.focus, fullMark: 100 },
    { skill: 'Productivity', value: weeklyStats.productivity, fullMark: 100 },
    { skill: 'Health', value: weeklyStats.health, fullMark: 100 },
    { skill: 'Sleep', value: weeklyStats.sleep, fullMark: 100 },
  ];

  const overallScore = Math.round(
    Object.values(weeklyStats).reduce((sum, val) => sum + val, 0) / 6
  );

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', color: 'text-yellow-400' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400' };
    if (score >= 70) return { grade: 'B', color: 'text-primary' };
    if (score >= 60) return { grade: 'C', color: 'text-orange-400' };
    return { grade: 'D', color: 'text-destructive' };
  };

  const { grade, color } = getGrade(overallScore);

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Weekly Review
        </h3>
        <div className="flex items-center gap-2">
          <Award className={`w-5 h-5 ${color}`} />
          <span className={`text-2xl font-bold ${color}`}>{grade}</span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="75%">
            <PolarGrid 
              stroke="hsl(var(--primary) / 0.2)" 
              strokeDasharray="3 3"
            />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ 
                fontSize: 10, 
                fill: 'hsl(var(--muted-foreground))',
              }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {radarData.map((item) => (
          <div 
            key={item.skill}
            className="text-center p-2 rounded-lg bg-muted/20 border border-primary/10"
          >
            <div className="text-xs text-muted-foreground mb-1">{item.skill}</div>
            <div className={`text-lg font-bold ${
              item.value >= 80 ? 'text-green-400' :
              item.value >= 60 ? 'text-primary' :
              item.value >= 40 ? 'text-yellow-400' :
              'text-destructive'
            }`}>
              {item.value}%
            </div>
          </div>
        ))}
      </div>

      {/* Overall Score */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Overall Score</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{overallScore}%</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReview;
