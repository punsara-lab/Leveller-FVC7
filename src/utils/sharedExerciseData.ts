export interface SharedExerciseData {
  pushUps: number;
  sitUps: number;
  squats: number;
  running: number;
  lastUpdated: string;
  source: 'dailyQuest' | 'physicalProgress';
}

export const getSharedExerciseData = (): SharedExerciseData => {
  const saved = localStorage.getItem('sharedExerciseData');
  return saved ? JSON.parse(saved) : {
    pushUps: 0,
    sitUps: 0,
    squats: 0,
    running: 0,
    lastUpdated: new Date().toISOString().split('T')[0],
    source: 'physicalProgress'
  };
};

export const saveSharedExerciseData = (data: SharedExerciseData): void => {
  localStorage.setItem('sharedExerciseData', JSON.stringify(data));
};

export const updateSharedExerciseData = (
  updates: Partial<Pick<SharedExerciseData, 'pushUps' | 'sitUps' | 'squats' | 'running'>>,
  source: 'dailyQuest' | 'physicalProgress'
): void => {
  const currentData = getSharedExerciseData();
  const today = new Date().toISOString().split('T')[0];
  
  // Only update if it's today's data
  if (currentData.lastUpdated === today) {
    const updatedData: SharedExerciseData = {
      ...currentData,
      ...updates,
      lastUpdated: today,
      source
    };
    saveSharedExerciseData(updatedData);
  } else {
    // Reset for new day
    const newData: SharedExerciseData = {
      pushUps: updates.pushUps || 0,
      sitUps: updates.sitUps || 0,
      squats: updates.squats || 0,
      running: updates.running || 0,
      lastUpdated: today,
      source
    };
    saveSharedExerciseData(newData);
  }
};