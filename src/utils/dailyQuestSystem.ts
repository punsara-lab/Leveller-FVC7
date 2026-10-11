import { getPlayerProgress, savePlayerProgress } from './levelSystem';
import { saveLevelUpNotification } from './levelUpNotification';

export interface DailyQuestTargets {
  pushUps: number;
  sitUps: number;
  squats: number;
  running: number;
}

export interface QuestPenalty {
  pushUps: number;
  sitUps: number;
  squats: number;
  running: number;
  reason: string;
}

export interface CompletedQuest {
  date: string;
  completed: DailyQuestTargets;
  isCompleted: boolean;
  levelGained: number;
  penalty?: QuestPenalty;
  penaltyCompleted?: boolean;
}

export interface DailyQuestProgress {
  lastQuestDate: string | null;
  missedDays: number;
  completedQuests: CompletedQuest[];
  weeklyMissedCount: number;
  lastWeekStart: string | null;
  consecutiveCompletions: number;
  lastCompletionDate: string | null;
}

const QUEST_START_DATE = new Date('2025-08-01');
const BASE_TARGETS: DailyQuestTargets = {
  pushUps: 50,
  sitUps: 30,
  squats: 30,
  running: 3
};

export const getDailyQuestProgress = (): DailyQuestProgress => {
  const saved = localStorage.getItem('dailyQuestProgress');
  return saved ? JSON.parse(saved) : {
    lastQuestDate: null,
    missedDays: 0,
    completedQuests: [],
    weeklyMissedCount: 0,
    lastWeekStart: null,
    consecutiveCompletions: 0,
    lastCompletionDate: null
  };
};

export const saveDailyQuestProgress = (progress: DailyQuestProgress): void => {
  localStorage.setItem('dailyQuestProgress', JSON.stringify(progress));
};

export const calculateMissedDays = (): number => {
  const today = new Date();
  const questProgress = getDailyQuestProgress();
  
  // If quest system hasn't started yet
  if (today < QUEST_START_DATE) return 0;
  
  const lastQuestDate = questProgress.lastQuestDate ? new Date(questProgress.lastQuestDate) : QUEST_START_DATE;
  const daysSince = Math.floor((today.getTime() - lastQuestDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Count days since last quest (excluding today)
  const missedDays = Math.max(0, daysSince - 1);
  
  return missedDays;
};

const generateRandomPenalty = (): QuestPenalty => {
  const penalties = [
    { pushUps: 10, sitUps: 0, squats: 0, running: 0, reason: "Missed Quest - Extra 10 Push-ups" },
    { pushUps: 0, sitUps: 10, squats: 0, running: 0, reason: "Missed Quest - Extra 10 Sit-ups" },
    { pushUps: 0, sitUps: 0, squats: 10, running: 0, reason: "Missed Quest - Extra 10 Squats" },
    { pushUps: 0, sitUps: 0, squats: 0, running: 0.5, reason: "Missed Quest - Extra 500m Run" }
  ];
  
  return penalties[Math.floor(Math.random() * penalties.length)];
};

export const calculateDailyQuestTargets = (): { targets: DailyQuestTargets; penalty?: QuestPenalty } => {
  const today = new Date().toISOString().split('T')[0];
  const questProgress = getDailyQuestProgress();
  
  // Check if there's a pending penalty from yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const yesterdayQuest = questProgress.completedQuests.find(q => q.date === yesterdayStr);
  const todayQuest = questProgress.completedQuests.find(q => q.date === today);
  
  let penalty: QuestPenalty | undefined;
  
  // If yesterday's quest wasn't completed and today doesn't have a penalty yet
  if (!yesterdayQuest && !todayQuest?.penalty) {
    penalty = generateRandomPenalty();
  }
  
  // Normal targets remain unchanged
  const targets = { ...BASE_TARGETS };
  
  return { targets, penalty };
};

const updateWeeklyTracking = (questProgress: DailyQuestProgress, completed: boolean): void => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  const weekStartStr = weekStart.toISOString().split('T')[0];
  
  // Reset weekly count if new week
  if (!questProgress.lastWeekStart || questProgress.lastWeekStart !== weekStartStr) {
    questProgress.weeklyMissedCount = 0;
    questProgress.lastWeekStart = weekStartStr;
  }
  
  // If quest not completed, increment missed count
  if (!completed) {
    questProgress.weeklyMissedCount++;
  }
};

const checkSpiritualPhysicalProgress = (requiredPercentage: number): boolean => {
  const playerProgress = getPlayerProgress();
  const today = new Date().toISOString().split('T')[0];
  const todayLog = playerProgress.dailyLogs.find(log => log.date === today);
  
  if (!todayLog) return false;
  
  const spiritualTarget = 50; // Base spiritual target
  const physicalTarget = 50; // Base physical target
  
  const spiritualPercent = (todayLog.spiritualMarks / spiritualTarget) * 100;
  const physicalPercent = (todayLog.physicalMarks / physicalTarget) * 100;
  
  return spiritualPercent >= requiredPercentage && physicalPercent >= requiredPercentage;
};

const calculateLevelUp = (playerLevel: number, questProgress: DailyQuestProgress): number => {
  const today = new Date().toISOString().split('T')[0];
  
  // Level 1-10: 1 day with 50% spiritual/physical + daily quest
  if (playerLevel < 10) {
    if (checkSpiritualPhysicalProgress(50)) {
      return 1;
    }
  }
  
  // Level 10-25: 2 consecutive days with 60% + daily quest
  else if (playerLevel < 25) {
    const requiredDays = 2;
    const recentCompletions = questProgress.completedQuests
      .filter(q => {
        const questDate = new Date(q.date);
        const daysDiff = Math.floor((new Date(today).getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff < requiredDays && q.isCompleted;
      }).length;
    
    if (recentCompletions >= requiredDays && checkSpiritualPhysicalProgress(60)) {
      // Check if spiritual/physical was met for the past days too (simplified)
      return 1;
    }
  }
  
  // Level 25-50: 3 consecutive days with 70% + daily quest
  else if (playerLevel < 50) {
    const requiredDays = 3;
    const recentCompletions = questProgress.completedQuests
      .filter(q => {
        const questDate = new Date(q.date);
        const daysDiff = Math.floor((new Date(today).getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff < requiredDays && q.isCompleted;
      }).length;
    
    if (recentCompletions >= requiredDays && checkSpiritualPhysicalProgress(70)) {
      return 1;
    }
  }
  
  // Level 50+: 7 consecutive days with 75% + daily quest
  else {
    const requiredDays = 7;
    const recentCompletions = questProgress.completedQuests
      .filter(q => {
        const questDate = new Date(q.date);
        const daysDiff = Math.floor((new Date(today).getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff < requiredDays && q.isCompleted;
      }).length;
    
    if (recentCompletions >= requiredDays && checkSpiritualPhysicalProgress(75)) {
      return 1;
    }
  }
  
  return 0;
};

export const completeDailyQuest = (completed: DailyQuestTargets): { newLevel: number; levelGained: number } => {
  const today = new Date().toISOString().split('T')[0];
  const questProgress = getDailyQuestProgress();
  const playerProgress = getPlayerProgress();
  const { targets, penalty } = calculateDailyQuestTargets();
  
  // Check if already completed today
  const existingQuest = questProgress.completedQuests.find(q => q.date === today);
  if (existingQuest) {
    return { newLevel: playerProgress.level, levelGained: 0 };
  }
  
  // Determine if quest is complete (normal targets only, penalty is separate)
  const isComplete = 
    completed.pushUps >= targets.pushUps &&
    completed.sitUps >= targets.sitUps &&
    completed.squats >= targets.squats &&
    completed.running >= targets.running;
  
  // Update quest progress
  questProgress.completedQuests.push({
    date: today,
    completed,
    isCompleted: isComplete,
    levelGained: 0,
    penalty
  });
  
  let levelGained = 0;
  
  if (isComplete) {
    questProgress.lastQuestDate = today;
    questProgress.consecutiveCompletions++;
    questProgress.lastCompletionDate = today;
    
    // Calculate level gain based on new system
    levelGained = calculateLevelUp(playerProgress.level, questProgress);
    
    if (levelGained > 0) {
      const oldLevel = playerProgress.level;
      playerProgress.level += levelGained;
      questProgress.completedQuests[questProgress.completedQuests.length - 1].levelGained = levelGained;
      
      // Trigger level up notification
      saveLevelUpNotification(playerProgress.level, oldLevel);
    }
  } else {
    questProgress.consecutiveCompletions = 0;
  }
  
  // Update weekly tracking
  updateWeeklyTracking(questProgress, isComplete);
  
  // Check for level reduction (more than 3 missed quests in a week)
  // BUT: Level 50+ players never lose levels
  if (questProgress.weeklyMissedCount > 3 && playerProgress.level > 1 && playerProgress.level < 50) {
    playerProgress.level = Math.max(1, playerProgress.level - 1);
    questProgress.weeklyMissedCount = 0; // Reset after penalty
  }
  
  // Save both
  saveDailyQuestProgress(questProgress);
  savePlayerProgress(playerProgress);
  
  return { newLevel: playerProgress.level, levelGained };
};

export const isQuestSystemActive = (): boolean => {
  const today = new Date();
  return today >= QUEST_START_DATE;
};

export const getDaysUntilQuestStart = (): number => {
  const today = new Date();
  if (today >= QUEST_START_DATE) return 0;
  
  return Math.ceil((QUEST_START_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};