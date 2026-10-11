export interface DailyLog {
  date: string;
  spiritualMarks: number;
  physicalMarks: number;
  totalMarks: number;
  isRestDay: boolean;
  restDayType?: 'spiritual' | 'physical';
}

export interface PlayerProgress {
  level: number;
  consecutiveDays: number;
  lastSpiritualRestDay: string | null;
  lastPhysicalRestDay: string | null;
  dailyLogs: DailyLog[];
}

export const calculateSpiritualMarks = (
  studyHours: number,
  meditationMinutes: number,
  didSpecial: boolean,
  natureTimeMinutes: number = 0
): number => {
  // Optimized calculation with early validation
  if (studyHours < 0 || meditationMinutes < 0 || natureTimeMinutes < 0) return 0;
  
  const studyMarks = Math.min(studyHours * 10, 100); // Cap at 100 for performance
  
  let medMarks: number;
  if (meditationMinutes <= 30) {
    medMarks = meditationMinutes;
  } else {
    // More efficient calculation for longer meditation
    medMarks = 30 + Math.floor((meditationMinutes - 30) / 15);
  }
  
  const specialBonus = didSpecial ? 10 : 0; // Increased special bonus
  const baseMarks = studyMarks + medMarks + specialBonus;
  
  // Nature bonus: +10% if 20+ minutes
  const natureBonus = natureTimeMinutes >= 20 ? baseMarks * 0.1 : 0;
  
  return Math.floor(baseMarks + natureBonus);
};

export const calculatePhysicalMarks = (
  pushUps: number,
  pullUps: number,
  sitUps: number,
  squats: number,
  runningKm: number,
  didMartialArts: boolean
): number => {
  // Optimized calculation with validation and performance improvements
  if (pushUps < 0 || pullUps < 0 || sitUps < 0 || squats < 0 || runningKm < 0) return 0;
  
  // More efficient calculations with better scaling
  const pushUpMarks = Math.min(Math.floor(pushUps / 5), 20); // Cap for performance
  const pullUpMarks = Math.min(Math.floor(pullUps / 2), 25); // Pull-ups are harder, better ratio
  const sitUpMarks = Math.min(Math.floor(sitUps / 10), 15); // Easier exercise, lower ratio
  const squatMarks = Math.min(Math.floor(squats / 8), 18);
  const runningMarks = Math.min(Math.floor(runningKm * 2), 30); // Better running rewards
  const martialArtsMarks = didMartialArts ? 15 : 0; // Increased martial arts bonus
  
  return pushUpMarks + pullUpMarks + sitUpMarks + squatMarks + runningMarks + martialArtsMarks;
};

export const canUseRestDay = (
  type: 'spiritual' | 'physical',
  lastRestDay: string | null
): boolean => {
  if (!lastRestDay) return true;
  
  const daysSinceRest = Math.floor(
    (new Date().getTime() - new Date(lastRestDay).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (type === 'spiritual') {
    return daysSinceRest >= 14;
  } else {
    return daysSinceRest >= 7;
  }
};

export const checkLevelUp = (dailyLogs: DailyLog[]): boolean => {
  if (dailyLogs.length < 7) return false;
  
  const lastSevenDays = dailyLogs.slice(-7);
  
  // More sophisticated level-up algorithm with progressive difficulty
  return lastSevenDays.every((log, index) => {
    if (log.isRestDay) return true; // Rest days count as valid
    
    // Progressive difficulty - later days in the week require higher performance
    const difficultyMultiplier = 1 + (index * 0.05); // 5% increase per day
    const requiredSpiritual = 25 * difficultyMultiplier;
    const requiredPhysical = 25 * difficultyMultiplier;
    
    return log.spiritualMarks >= requiredSpiritual && log.physicalMarks >= requiredPhysical;
  });
};

// Optimized storage operations with caching
let cachedProgress: PlayerProgress | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

export const getPlayerProgress = (): PlayerProgress => {
  const now = Date.now();
  
  // Return cached version if still valid
  if (cachedProgress && (now - lastCacheTime) < CACHE_DURATION) {
    return cachedProgress;
  }
  
  try {
    const saved = localStorage.getItem('playerProgress');
    const progress = saved ? JSON.parse(saved) : {
      level: 1,
      consecutiveDays: 0,
      lastSpiritualRestDay: null,
      lastPhysicalRestDay: null,
      dailyLogs: []
    };
    
    // Update cache
    cachedProgress = progress;
    lastCacheTime = now;
    
    return progress;
  } catch (error) {
    console.error('Error loading player progress:', error);
    return {
      level: 1,
      consecutiveDays: 0,
      lastSpiritualRestDay: null,
      lastPhysicalRestDay: null,
      dailyLogs: []
    };
  }
};

export const savePlayerProgress = (progress: PlayerProgress): void => {
  try {
    localStorage.setItem('playerProgress', JSON.stringify(progress));
    // Update cache
    cachedProgress = progress;
    lastCacheTime = Date.now();
  } catch (error) {
    console.error('Error saving player progress:', error);
  }
};

export const getRestDayBonus = (): number => 50; // 50% bonus marks for rest day