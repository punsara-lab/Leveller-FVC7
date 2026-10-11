import { DailyLog, PlayerProgress, getPlayerProgress } from './levelSystem';
import { DailyQuestProgress, getDailyQuestProgress } from './dailyQuestSystem';

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalDays: number;
  completedDays: number;
  averageSpiritualMarks: number;
  averagePhysicalMarks: number;
  totalMarks: number;
  restDaysUsed: number;
  rank: string;
  achievements: string[];
  recommendations: string[];
}

export interface MonthlyReport {
  monthStart: string;
  monthEnd: string;
  totalDays: number;
  completedDays: number;
  averageSpiritualMarks: number;
  averagePhysicalMarks: number;
  totalMarks: number;
  restDaysUsed: number;
  levelProgress: number;
  rank: string;
  achievements: string[];
  trends: string[];
  recommendations: string[];
}

export interface ReportLog {
  id: string;
  type: 'weekly' | 'monthly';
  generatedAt: string;
  report: WeeklyReport | MonthlyReport;
}

const getRank = (averagePerformance: number): string => {
  if (averagePerformance >= 90) return 'LEGENDARY';
  if (averagePerformance >= 80) return 'EXCELLENT';
  if (averagePerformance >= 70) return 'GREAT';
  if (averagePerformance >= 60) return 'GOOD';
  if (averagePerformance >= 50) return 'DECENT';
  if (averagePerformance >= 40) return 'NEEDS IMPROVEMENT';
  return 'COME ON, YOU CAN DO BETTER!';
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const generateWeeklyReport = (weekDate?: Date): WeeklyReport => {
  const playerProgress = getPlayerProgress();
  const targetDate = weekDate || new Date();
  const weekStart = getWeekStart(targetDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekLogs = playerProgress.dailyLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= weekStart && logDate <= weekEnd;
  });

  const completedDays = weekLogs.filter(log => !log.isRestDay && (log.spiritualMarks > 0 || log.physicalMarks > 0)).length;
  const restDaysUsed = weekLogs.filter(log => log.isRestDay).length;
  
  const totalSpiritualMarks = weekLogs.reduce((sum, log) => sum + log.spiritualMarks, 0);
  const totalPhysicalMarks = weekLogs.reduce((sum, log) => sum + log.physicalMarks, 0);
  const totalMarks = weekLogs.reduce((sum, log) => sum + log.totalMarks, 0);
  
  const averageSpiritualMarks = weekLogs.length > 0 ? totalSpiritualMarks / weekLogs.length : 0;
  const averagePhysicalMarks = weekLogs.length > 0 ? totalPhysicalMarks / weekLogs.length : 0;
  const averagePerformance = ((averageSpiritualMarks + averagePhysicalMarks) / 100) * 100;

  const achievements: string[] = [];
  const recommendations: string[] = [];

  if (completedDays === 7) achievements.push('Perfect week - no missed days!');
  if (averageSpiritualMarks >= 40) achievements.push('Strong spiritual discipline');
  if (averagePhysicalMarks >= 40) achievements.push('Excellent physical training');
  if (restDaysUsed === 0) achievements.push('No rest days needed - incredible stamina!');
  
  if (completedDays < 5) recommendations.push('Try to maintain consistency - aim for at least 5 days per week');
  if (averageSpiritualMarks < 25) recommendations.push('Increase study hours and meditation time');
  if (averagePhysicalMarks < 25) recommendations.push('Focus more on physical exercises');
  if (weekLogs.length < 3) recommendations.push('Remember to log your daily progress');

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: weekEnd.toISOString().split('T')[0],
    totalDays: weekLogs.length,
    completedDays,
    averageSpiritualMarks: Math.round(averageSpiritualMarks),
    averagePhysicalMarks: Math.round(averagePhysicalMarks),
    totalMarks: Math.round(totalMarks),
    restDaysUsed,
    rank: getRank(averagePerformance),
    achievements,
    recommendations
  };
};

export const generateMonthlyReport = (monthDate?: Date): MonthlyReport => {
  const playerProgress = getPlayerProgress();
  const targetDate = monthDate || new Date();
  const monthStart = getMonthStart(targetDate);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  const monthLogs = playerProgress.dailyLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= monthStart && logDate <= monthEnd;
  });

  const completedDays = monthLogs.filter(log => !log.isRestDay && (log.spiritualMarks > 0 || log.physicalMarks > 0)).length;
  const restDaysUsed = monthLogs.filter(log => log.isRestDay).length;
  
  const totalSpiritualMarks = monthLogs.reduce((sum, log) => sum + log.spiritualMarks, 0);
  const totalPhysicalMarks = monthLogs.reduce((sum, log) => sum + log.physicalMarks, 0);
  const totalMarks = monthLogs.reduce((sum, log) => sum + log.totalMarks, 0);
  
  const averageSpiritualMarks = monthLogs.length > 0 ? totalSpiritualMarks / monthLogs.length : 0;
  const averagePhysicalMarks = monthLogs.length > 0 ? totalPhysicalMarks / monthLogs.length : 0;
  const averagePerformance = ((averageSpiritualMarks + averagePhysicalMarks) / 100) * 100;

  const achievements: string[] = [];
  const trends: string[] = [];
  const recommendations: string[] = [];

  // Calculate weekly trends
  const weeks = Math.ceil(monthLogs.length / 7);
  const weeklyAverages: number[] = [];
  for (let i = 0; i < weeks; i++) {
    const weekStart = i * 7;
    const weekEnd = Math.min((i + 1) * 7, monthLogs.length);
    const weekLogs = monthLogs.slice(weekStart, weekEnd);
    const weekAverage = weekLogs.reduce((sum, log) => sum + log.totalMarks, 0) / weekLogs.length;
    weeklyAverages.push(weekAverage);
  }

  if (weeklyAverages.length > 1) {
    const lastWeek = weeklyAverages[weeklyAverages.length - 1];
    const firstWeek = weeklyAverages[0];
    if (lastWeek > firstWeek) trends.push('Improving trend - getting stronger!');
    else if (lastWeek < firstWeek) trends.push('Declining trend - need to refocus');
    else trends.push('Steady performance maintained');
  }

  if (completedDays >= 25) achievements.push('Outstanding consistency this month!');
  if (averageSpiritualMarks >= 35) achievements.push('Spiritual warrior level achieved');
  if (averagePhysicalMarks >= 35) achievements.push('Physical excellence demonstrated');
  if (playerProgress.level > 1) achievements.push(`Reached level ${playerProgress.level}!`);
  
  if (completedDays < 20) recommendations.push('Aim for better consistency - target 20+ days per month');
  if (averageSpiritualMarks < 20) recommendations.push('Develop a stronger spiritual practice routine');
  if (averagePhysicalMarks < 20) recommendations.push('Increase physical training intensity');
  if (restDaysUsed > 6) recommendations.push('Consider building more stamina to reduce rest day usage');

  return {
    monthStart: monthStart.toISOString().split('T')[0],
    monthEnd: monthEnd.toISOString().split('T')[0],
    totalDays: monthLogs.length,
    completedDays,
    averageSpiritualMarks: Math.round(averageSpiritualMarks),
    averagePhysicalMarks: Math.round(averagePhysicalMarks),
    totalMarks: Math.round(totalMarks),
    restDaysUsed,
    levelProgress: playerProgress.level,
    rank: getRank(averagePerformance),
    achievements,
    trends,
    recommendations
  };
};

export const formatReportAsText = (report: WeeklyReport | MonthlyReport, type: 'weekly' | 'monthly'): string => {
  const isWeekly = type === 'weekly';
  const title = isWeekly ? 'WEEKLY PROGRESS REPORT' : 'MONTHLY PROGRESS REPORT';
  const period = isWeekly 
    ? `Week: ${(report as WeeklyReport).weekStart} to ${(report as WeeklyReport).weekEnd}`
    : `Month: ${(report as MonthlyReport).monthStart} to ${(report as MonthlyReport).monthEnd}`;

  let text = `
==========================================================
                    ${title}
==========================================================

${period}
Generated on: ${new Date().toLocaleDateString()}

==========================================================
                     PERFORMANCE OVERVIEW
==========================================================

📊 STATISTICS:
• Total Days Logged: ${report.totalDays}
• Days Completed: ${report.completedDays}
• Rest Days Used: ${report.restDaysUsed}
• Completion Rate: ${report.totalDays > 0 ? Math.round((report.completedDays / report.totalDays) * 100) : 0}%

💪 AVERAGE SCORES:
• Spiritual Marks: ${report.averageSpiritualMarks}/50
• Physical Marks: ${report.averagePhysicalMarks}/50
• Total Marks: ${report.totalMarks}

🏆 RANK: ${report.rank}

==========================================================
                       ACHIEVEMENTS
==========================================================
`;

  if (report.achievements.length > 0) {
    report.achievements.forEach((achievement, index) => {
      text += `${index + 1}. ${achievement}\n`;
    });
  } else {
    text += "No achievements this period. Keep pushing forward!\n";
  }

  if ('trends' in report && report.trends.length > 0) {
    text += `
==========================================================
                        TRENDS
==========================================================
`;
    report.trends.forEach((trend, index) => {
      text += `${index + 1}. ${trend}\n`;
    });
  }

  text += `
==========================================================
                     RECOMMENDATIONS
==========================================================
`;

  if (report.recommendations.length > 0) {
    report.recommendations.forEach((rec, index) => {
      text += `${index + 1}. ${rec}\n`;
    });
  } else {
    text += "Excellent work! Keep maintaining your current routine.\n";
  }

  if ('levelProgress' in report) {
    text += `
==========================================================
                    LEVEL PROGRESS
==========================================================
Current Level: ${report.levelProgress}
`;
  }

  text += `
==========================================================
"The journey of a thousand miles begins with one step.
 Keep moving forward, warrior!"
==========================================================

Generated by Personal Development Tracking System
`;

  return text;
};

export const downloadReport = (report: WeeklyReport | MonthlyReport, type: 'weekly' | 'monthly'): void => {
  const textContent = formatReportAsText(report, type);
  const isWeekly = type === 'weekly';
  const dateStr = isWeekly 
    ? (report as WeeklyReport).weekStart 
    : (report as MonthlyReport).monthStart;
  
  const filename = `${type}_report_${dateStr}.txt`;
  
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const saveReportToLog = (report: WeeklyReport | MonthlyReport, type: 'weekly' | 'monthly'): void => {
  const reportLog: ReportLog = {
    id: `${type}_${Date.now()}`,
    type,
    generatedAt: new Date().toISOString(),
    report
  };

  const existingLogs = getReportLogs();
  existingLogs.push(reportLog);
  localStorage.setItem('reportLogs', JSON.stringify(existingLogs));
};

export const getReportLogs = (): ReportLog[] => {
  const saved = localStorage.getItem('reportLogs');
  return saved ? JSON.parse(saved) : [];
};

export const clearReportLogs = (): void => {
  localStorage.removeItem('reportLogs');
};