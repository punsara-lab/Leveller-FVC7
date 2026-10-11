interface LevelUpState {
  pendingLevelUp: {
    newLevel: number;
    oldLevel: number;
    timestamp: number;
  } | null;
  lastShownLevel: number;
}

const LEVEL_UP_STORAGE_KEY = 'levelUpNotification';

export const saveLevelUpNotification = (newLevel: number, oldLevel: number) => {
  const levelUpState: LevelUpState = {
    pendingLevelUp: {
      newLevel,
      oldLevel,
      timestamp: Date.now()
    },
    lastShownLevel: oldLevel
  };
  
  localStorage.setItem(LEVEL_UP_STORAGE_KEY, JSON.stringify(levelUpState));
};

export const getPendingLevelUp = (): LevelUpState['pendingLevelUp'] => {
  try {
    const stored = localStorage.getItem(LEVEL_UP_STORAGE_KEY);
    if (!stored) return null;
    
    const levelUpState: LevelUpState = JSON.parse(stored);
    const now = Date.now();
    
    // Level up notification expires after 24 hours
    if (levelUpState.pendingLevelUp && (now - levelUpState.pendingLevelUp.timestamp) > 24 * 60 * 60 * 1000) {
      clearLevelUpNotification();
      return null;
    }
    
    return levelUpState.pendingLevelUp;
  } catch {
    return null;
  }
};

export const clearLevelUpNotification = () => {
  localStorage.removeItem(LEVEL_UP_STORAGE_KEY);
};

export const hasNewLevelUp = (currentLevel: number): boolean => {
  const pending = getPendingLevelUp();
  return pending !== null && pending.newLevel === currentLevel;
};

export const triggerLevelUp = (oldLevel: number, newLevel: number) => {
  saveLevelUpNotification(newLevel, oldLevel);
};