import { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Calendar, Zap, Award } from 'lucide-react';
import { format } from 'date-fns';
import { 
  getPlayerProgress, 
  PlayerProgress, 
  savePlayerProgress,
  checkLevelUp,
  calculateSpiritualMarks,
  calculatePhysicalMarks,
  DailyLog
} from '@/utils/levelSystem';
import { 
  generateWeeklyReport, 
  generateMonthlyReport, 
  downloadReport,
  formatReportAsText 
} from '@/utils/reportSystem';
import { triggerLevelUp } from '@/utils/levelUpNotification';

interface ProgressReportPanelProps {
  studyHours: number;
  trainingData: {
    pushUps: number;
    sitUps: number;
    pullUps: number;
    squats: number;
    runKm: number;
    martialArts: boolean;
  };
  meditationMinutes?: number;
}

const ProgressReportPanel = ({ studyHours, trainingData, meditationMinutes = 0 }: ProgressReportPanelProps) => {
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const progress = getPlayerProgress();
    setPlayerProgress(progress);
  }, []);

  // Save today's progress to the leveling system
  const saveTodaysProgress = () => {
    if (!playerProgress) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Calculate marks using the level system
    const spiritualMarks = calculateSpiritualMarks(studyHours, meditationMinutes, false);
    const physicalMarks = calculatePhysicalMarks(
      trainingData.pushUps,
      trainingData.pullUps,
      trainingData.sitUps,
      trainingData.squats,
      trainingData.runKm,
      trainingData.martialArts
    );

    const todayLog: DailyLog = {
      date: today,
      spiritualMarks,
      physicalMarks,
      totalMarks: spiritualMarks + physicalMarks,
      isRestDay: false,
    };

    // Update logs
    const existingIndex = playerProgress.dailyLogs.findIndex(l => l.date === today);
    let newLogs = [...playerProgress.dailyLogs];
    
    if (existingIndex >= 0) {
      newLogs[existingIndex] = todayLog;
    } else {
      newLogs.push(todayLog);
    }

    // Keep only last 60 days
    if (newLogs.length > 60) {
      newLogs = newLogs.slice(-60);
    }

    // Check for level up
    const oldLevel = playerProgress.level;
    const shouldLevelUp = checkLevelUp(newLogs);
    const newLevel = shouldLevelUp ? oldLevel + 1 : oldLevel;

    if (shouldLevelUp && newLevel > oldLevel) {
      triggerLevelUp(oldLevel, newLevel);
      setShowLevelUp(true);
    }

    const updatedProgress: PlayerProgress = {
      ...playerProgress,
      level: newLevel,
      consecutiveDays: playerProgress.consecutiveDays + 1,
      dailyLogs: newLogs,
    };

    savePlayerProgress(updatedProgress);
    setPlayerProgress(updatedProgress);
  };

  const handleDownloadWeekly = () => {
    const report = generateWeeklyReport();
    downloadReport(report, 'weekly');
  };

  const handleDownloadMonthly = () => {
    const report = generateMonthlyReport();
    downloadReport(report, 'monthly');
  };

  const handleDownloadFullProgress = () => {
    if (!playerProgress) return;

    const studyData = JSON.parse(localStorage.getItem('rx1_study_tracker_v2') || '[]');
    const trainingLogs = JSON.parse(localStorage.getItem('rx1_training_logs') || '[]');
    const dailyLogs = JSON.parse(localStorage.getItem('rx1_daily_logs') || '[]');

    let text = `FVC7 PROTOCOL - FULL PROGRESS REPORT
═══════════════════════════════════════════════════════════
Generated: ${format(new Date(), 'EEEE, MMMM d, yyyy HH:mm')}

═══════════════════════════════════════════════════════════
                      PLAYER STATUS
═══════════════════════════════════════════════════════════

⚡ CURRENT LEVEL: ${playerProgress.level}
🔥 CONSECUTIVE DAYS: ${playerProgress.consecutiveDays}
📊 TOTAL DAYS LOGGED: ${playerProgress.dailyLogs.length}

═══════════════════════════════════════════════════════════
                     STUDY PROGRESS
═══════════════════════════════════════════════════════════
`;

    if (studyData.length > 0) {
      studyData.forEach((subject: any) => {
        const progress = Math.round((subject.chapters / subject.totalChapters) * 100);
        text += `
${subject.icon} ${subject.name.toUpperCase()}
  • Chapters: ${subject.chapters}/${subject.totalChapters} (${progress}%)
  • Hours Studied: ${subject.hours}h
  • MCQs Completed: ${subject.mcqs || 0}
`;
      });
    }

    text += `
═══════════════════════════════════════════════════════════
                    TRAINING HISTORY
═══════════════════════════════════════════════════════════
`;

    if (trainingLogs.length > 0) {
      const totalPushUps = trainingLogs.reduce((sum: number, l: any) => sum + (l.pushUps || 0), 0);
      const totalSitUps = trainingLogs.reduce((sum: number, l: any) => sum + (l.sitUps || 0), 0);
      const totalPullUps = trainingLogs.reduce((sum: number, l: any) => sum + (l.pullUps || 0), 0);
      const totalSquats = trainingLogs.reduce((sum: number, l: any) => sum + (l.squats || 0), 0);
      const totalRunKm = trainingLogs.reduce((sum: number, l: any) => sum + (l.runKm || 0), 0);
      const martialArtsDays = trainingLogs.filter((l: any) => l.martialArts).length;

      text += `
LIFETIME TOTALS:
  💪 Push-ups: ${totalPushUps}
  🔥 Sit-ups: ${totalSitUps}
  🏋️ Pull-ups: ${totalPullUps}
  🦵 Squats: ${totalSquats}
  🏃 Running: ${totalRunKm.toFixed(1)} km
  ⚔️ Martial Arts Days: ${martialArtsDays}
`;
    }

    text += `
═══════════════════════════════════════════════════════════
                  LEVEL PROGRESSION
═══════════════════════════════════════════════════════════
`;

    // Show recent daily logs
    const recentLogs = playerProgress.dailyLogs.slice(-14);
    if (recentLogs.length > 0) {
      text += `
Last 14 Days:
`;
      recentLogs.forEach(log => {
        const icon = log.isRestDay ? '😴' : (log.totalMarks >= 50 ? '✅' : '📝');
        text += `  ${icon} ${log.date}: Spiritual ${log.spiritualMarks} | Physical ${log.physicalMarks} | Total ${log.totalMarks}
`;
      });
    }

    // Weekly report summary
    const weeklyReport = generateWeeklyReport();
    text += `
═══════════════════════════════════════════════════════════
                    WEEKLY SUMMARY
═══════════════════════════════════════════════════════════

📊 This Week:
  • Days Completed: ${weeklyReport.completedDays}
  • Avg Spiritual: ${weeklyReport.averageSpiritualMarks}
  • Avg Physical: ${weeklyReport.averagePhysicalMarks}
  • Total Marks: ${weeklyReport.totalMarks}
  • Rank: ${weeklyReport.rank}
`;

    if (weeklyReport.achievements.length > 0) {
      text += `
🏆 Achievements:
`;
      weeklyReport.achievements.forEach(a => {
        text += `  • ${a}
`;
      });
    }

    if (weeklyReport.recommendations.length > 0) {
      text += `
💡 Recommendations:
`;
      weeklyReport.recommendations.forEach(r => {
        text += `  • ${r}
`;
      });
    }

    text += `
═══════════════════════════════════════════════════════════
        "Daily Execution Determines Destiny."
═══════════════════════════════════════════════════════════
                   FVC7 System
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FVC7_Full_Progress_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentLevel = playerProgress?.level || 1;
  const totalLogs = playerProgress?.dailyLogs.length || 0;

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Progress & Reports
        </h3>
      </div>

      {/* Level Display */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Current Level</div>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {currentLevel}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Days Logged</div>
            <div className="text-xl font-bold text-foreground">{totalLogs}</div>
          </div>
        </div>
      </div>

      {/* Save Progress Button */}
      <button
        onClick={saveTodaysProgress}
        className="w-full mb-4 p-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-all text-green-400 font-medium flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        Save Today's Progress
      </button>

      {/* Download Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleDownloadWeekly}
          className="w-full p-2.5 rounded-xl bg-muted/20 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 transition-all text-foreground flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm">Weekly Report</span>
          </div>
          <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={handleDownloadMonthly}
          className="w-full p-2.5 rounded-xl bg-muted/20 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 transition-all text-foreground flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span className="text-sm">Monthly Report</span>
          </div>
          <Download className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
        </button>

        <button
          onClick={handleDownloadFullProgress}
          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 border border-primary/20 transition-all text-foreground flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Full Progress Report</span>
          </div>
          <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default ProgressReportPanel;
