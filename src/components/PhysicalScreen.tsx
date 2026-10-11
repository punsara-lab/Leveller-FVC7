import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  calculatePhysicalMarks, 
  getPlayerProgress, 
  savePlayerProgress, 
  canUseRestDay,
  getRestDayBonus,
  checkLevelUp,
  type DailyLog 
} from '@/utils/levelSystem';
import { getSharedExerciseData, updateSharedExerciseData } from '@/utils/sharedExerciseData';

const PhysicalScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [pushUps, setPushUps] = useState<number>(0);
  const [pullUps, setPullUps] = useState<number>(0);
  const [sitUps, setSitUps] = useState<number>(0);
  const [squats, setSquats] = useState<number>(0);
  const [runningKm, setRunningKm] = useState<number>(0);
  const [didMartialArts, setDidMartialArts] = useState<boolean>(false);
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [isRestDay, setIsRestDay] = useState<boolean>(false);
  
  const playerProgress = getPlayerProgress();
  const canUseRestDayToday = canUseRestDay('physical', playerProgress.lastPhysicalRestDay);

  // Load shared exercise data on component mount
  useEffect(() => {
    const sharedData = getSharedExerciseData();
    const today = new Date().toISOString().split('T')[0];
    
    if (sharedData.lastUpdated === today && sharedData.source === 'dailyQuest') {
      setPushUps(sharedData.pushUps);
      setSitUps(sharedData.sitUps);
      setSquats(sharedData.squats);
      setRunningKm(sharedData.running);
    }
  }, []);

  // Update shared data when values change
  const updateSharedData = (updates: any) => {
    updateSharedExerciseData({
      pushUps: updates.pushUps ?? pushUps,
      sitUps: updates.sitUps ?? sitUps,
      squats: updates.squats ?? squats,
      running: updates.running ?? runningKm
    }, 'physicalProgress');
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split('T')[0];
    let marks = 0;
    
    if (isRestDay && canUseRestDayToday) {
      marks = getRestDayBonus();
      playerProgress.lastPhysicalRestDay = today;
      
      toast({
        title: "⚠️ Rest Day Activated",
        description: `You used your physical rest day. Next available in 7 days. +${marks} bonus marks!`,
      });
    } else if (isRestDay && !canUseRestDayToday) {
      toast({
        title: "❌ Rest Day Not Available",
        description: "You can only use a physical rest day once every 7 days!",
      });
      return;
    } else {
      marks = calculatePhysicalMarks(pushUps, pullUps, sitUps, squats, runningKm, didMartialArts);
    }
    
    // Create or update daily log
    const existingLogIndex = playerProgress.dailyLogs.findIndex(log => log.date === today);
    if (existingLogIndex >= 0) {
      playerProgress.dailyLogs[existingLogIndex].physicalMarks = marks;
      playerProgress.dailyLogs[existingLogIndex].totalMarks = 
        playerProgress.dailyLogs[existingLogIndex].spiritualMarks + marks;
    } else {
      const dailyLog: DailyLog = {
        date: today,
        spiritualMarks: 0,
        physicalMarks: marks,
        totalMarks: marks,
        isRestDay: isRestDay,
        restDayType: isRestDay ? 'physical' : undefined
      };
      playerProgress.dailyLogs.push(dailyLog);
    }
    
    // Check for level up
    if (checkLevelUp(playerProgress.dailyLogs)) {
      playerProgress.level += 1;
      playerProgress.consecutiveDays = 0;
      
      toast({
        title: "🎉 LEVEL UP!",
        description: `Congratulations! You've reached Level ${playerProgress.level}!`,
      });
    }
    
    savePlayerProgress(playerProgress);
    
    // Legacy physical logs
    const logData = {
      date: today,
      pushUps,
      pullUps,
      sitUps,
      squats,
      runningKm,
      didMartialArts,
      workoutDuration,
      specialNotes,
      totalMarks: marks,
      isRestDay,
      timestamp: new Date().toISOString()
    };

    const existingLogs = JSON.parse(localStorage.getItem('physicalLogs') || '[]');
    const updatedLogs = [...existingLogs, logData];
    localStorage.setItem('physicalLogs', JSON.stringify(updatedLogs));

    if (!isRestDay) {
      toast({
        title: "💪 Physical Progress Logged!",
        description: `You earned ${marks} marks today. Keep training!`,
      });
    }

    // Reset form
    setPushUps(0);
    setPullUps(0);
    setSitUps(0);
    setSquats(0);
    setRunningKm(0);
    setDidMartialArts(false);
    setWorkoutDuration(0);
    setSpecialNotes('');
    setIsRestDay(false);
    
    setTimeout(() => {
      navigate('/mission');
    }, 2000);
  };

  // Calculate total marks
  const totalMarks = isRestDay ? getRestDayBonus() : calculatePhysicalMarks(pushUps, pullUps, sitUps, squats, runningKm, didMartialArts);
  
  // Calculate intensity based on marks
  const getIntensityLevel = () => {
    if (isRestDay) return { level: 'REST DAY', color: 'text-neon-orange', intensity: 100 };
    if (totalMarks === 0) return { level: 'INACTIVE', color: 'text-muted-foreground', intensity: 0 };
    if (totalMarks < 10) return { level: 'LIGHT', color: 'text-neon-green', intensity: 25 };
    if (totalMarks < 20) return { level: 'MODERATE', color: 'text-neon-cyan', intensity: 50 };
    if (totalMarks < 30) return { level: 'INTENSE', color: 'text-neon-orange', intensity: 75 };
    return { level: 'EXTREME', color: 'text-destructive', intensity: 100 };
  };

  const intensity = getIntensityLevel();

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-orbitron font-bold text-neon-orange glow-text mb-4">
            PHYSICAL PROGRESS
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-orange via-neon-cyan to-neon-green mx-auto rounded-full"></div>
        </div>

        {/* Motivational Header */}
        <div className="sci-fi-container mb-8 text-center">
          <div className="text-2xl font-exo italic text-neon-orange glow-text mb-2">
            "The strongest people are forged in fires of adversity."
          </div>
          <div className="text-sm text-muted-foreground">— Train Like a Hunter</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="sci-fi-container">
              <h3 className="text-xl font-orbitron text-neon-orange mb-6">🏋️ TODAY'S TRAINING</h3>
              
              {/* Exercise Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Push-ups */}
                <div>
                  <label className="block text-sm font-orbitron text-neon-blue mb-2">
                    💪 Push-ups
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pushUps}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      setPushUps(newValue);
                      updateSharedData({ pushUps: newValue });
                    }}
                    className="sci-fi-input w-full"
                    placeholder="0"
                    disabled={isRestDay}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.floor(pushUps / 5)} marks
                  </div>
                </div>

                {/* Pull-ups */}
                <div>
                  <label className="block text-sm font-orbitron text-neon-blue mb-2">
                    🤏 Pull-ups
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pullUps}
                    onChange={(e) => setPullUps(Number(e.target.value))}
                    className="sci-fi-input w-full"
                    placeholder="0"
                    disabled={isRestDay}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.floor(pullUps / 5)} marks
                  </div>
                </div>

                {/* Sit-ups */}
                <div>
                  <label className="block text-sm font-orbitron text-neon-blue mb-2">
                    🔄 Sit-ups
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sitUps}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      setSitUps(newValue);
                      updateSharedData({ sitUps: newValue });
                    }}
                    className="sci-fi-input w-full"
                    placeholder="0"
                    disabled={isRestDay}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.floor(sitUps / 5)} marks
                  </div>
                </div>

                {/* Squats */}
                <div>
                  <label className="block text-sm font-orbitron text-neon-blue mb-2">
                    🏃 Squats
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={squats}
                    onChange={(e) => {
                      const newValue = Number(e.target.value);
                      setSquats(newValue);
                      updateSharedData({ squats: newValue });
                    }}
                    className="sci-fi-input w-full"
                    placeholder="0"
                    disabled={isRestDay}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.floor(squats / 5)} marks
                  </div>
                </div>
              </div>

              {/* Running Distance */}
              <div className="mb-6">
                <label className="block text-sm font-orbitron text-neon-green mb-2">
                  🏃‍♂️ Running Distance (km)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={runningKm}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    setRunningKm(newValue);
                    updateSharedData({ running: newValue });
                  }}
                  className="sci-fi-input w-full"
                  placeholder="0.0"
                  disabled={isRestDay}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.floor(runningKm / 0.5)} marks (1 mark per 0.5km)
                </div>
              </div>

              {/* Martial Arts */}
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={didMartialArts}
                    onChange={(e) => setDidMartialArts(e.target.checked)}
                    disabled={isRestDay}
                    className="w-5 h-5 rounded border-2 border-neon-purple bg-transparent checked:bg-neon-purple disabled:opacity-50"
                  />
                  <span className="text-sm font-orbitron text-neon-purple">
                    🥋 Practiced Martial Arts (10 marks)
                  </span>
                </label>
              </div>

              {/* Special Notes */}
              <div className="mb-6">
                <label className="block text-sm font-orbitron text-neon-cyan mb-2">
                  📋 Special Notes (No marks)
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="sci-fi-input w-full h-20 resize-none"
                  placeholder="Write about your training experience..."
                  disabled={isRestDay}
                />
              </div>

              {/* Rest Day Option */}
              <div className="mb-6 p-4 bg-neon-orange/10 border border-neon-orange/30 rounded-lg">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRestDay}
                    onChange={(e) => setIsRestDay(e.target.checked)}
                    disabled={!canUseRestDayToday}
                    className="w-5 h-5 rounded border-2 border-neon-orange bg-transparent checked:bg-neon-orange disabled:opacity-50"
                  />
                  <span className="text-sm font-orbitron text-neon-orange">
                    🛌 Mark today as Rest Day
                  </span>
                </label>
                <div className="text-xs text-muted-foreground mt-2">
                  {canUseRestDayToday 
                    ? `Available! Get ${getRestDayBonus()} bonus marks. Next available in 7 days.`
                    : "Not available yet. Available once every 7 days."
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="space-y-6">
            {/* Marks & Intensity */}
            <div className="sci-fi-container">
              <h3 className="text-xl font-orbitron text-neon-orange mb-6">💎 MARKS & INTENSITY</h3>
              
              {/* Total Marks Display */}
              <div className="text-center mb-6">
                <div className="text-4xl font-orbitron font-bold text-neon-orange glow-text">
                  {totalMarks} MARKS
                </div>
                <div className="text-sm text-muted-foreground">Today's Physical Progress</div>
              </div>
              
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="hsl(var(--neon-orange))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - intensity.intensity / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 10px hsl(var(--neon-orange) / 0.5))'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-orbitron font-bold text-neon-orange">
                    {intensity.intensity}%
                  </span>
                  <span className={`text-sm font-orbitron ${intensity.color}`}>
                    {intensity.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Exercise Breakdown */}
            <div className="sci-fi-container">
              <h3 className="text-xl font-orbitron text-neon-cyan mb-4">📊 MARKS BREAKDOWN</h3>
              
              {isRestDay ? (
                <div className="text-center p-6 bg-neon-orange/20 rounded-lg">
                  <div className="text-3xl mb-2">🛌</div>
                  <div className="text-lg font-orbitron text-neon-orange">REST DAY</div>
                  <div className="text-sm text-muted-foreground">Recovery is part of growth</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">Push-ups:</span>
                    <span className="font-orbitron text-neon-green">{Math.floor(pushUps / 5)} marks</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">Pull-ups:</span>
                    <span className="font-orbitron text-neon-blue">{Math.floor(pullUps / 5)} marks</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">Sit-ups:</span>
                    <span className="font-orbitron text-neon-cyan">{Math.floor(sitUps / 5)} marks</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">Squats:</span>
                    <span className="font-orbitron text-neon-purple">{Math.floor(squats / 5)} marks</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">Running:</span>
                    <span className="font-orbitron text-neon-orange">{Math.floor(runningKm / 0.5)} marks</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">Martial Arts:</span>
                    <span className="font-orbitron text-neon-purple">{didMartialArts ? 10 : 0} marks</span>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-gradient-to-r from-neon-orange/20 to-neon-cyan/20 rounded-lg">
                <h4 className="font-orbitron text-neon-orange mb-2">🎯 TRAINING GOALS</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• 50+ push-ups for strength mastery</li>
                  <li>• 5km runs for endurance</li>
                  <li>• Master martial arts daily</li>
                  <li>• Reach 30+ marks consistently</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 mt-8">
          <button
            onClick={() => navigate('/mission')}
            className="flex-1 neon-button-secondary py-4"
          >
            ← Back to Mission
          </button>
          
          <button
            onClick={handleSubmit}
            className="flex-1 neon-button-accent py-4 group relative overflow-hidden"
            disabled={!isRestDay && (pushUps === 0 && pullUps === 0 && sitUps === 0 && squats === 0 && runningKm === 0 && !didMartialArts)}
          >
            <span className="relative z-10">
              {isRestDay ? '🛌 SUBMIT REST DAY' : '💪 SUBMIT TRAINING'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-orange to-neon-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Achievement Preview */}
        {(totalMarks >= 30 || pushUps >= 50 || didMartialArts) && !isRestDay && (
          <div className="mt-8 sci-fi-container text-center">
            <div className="text-lg font-orbitron text-neon-green mb-2">🏆 ACHIEVEMENT UNLOCKED!</div>
            <div className="text-sm text-muted-foreground">
              {totalMarks >= 30 && "Elite Warrior • "}
              {pushUps >= 50 && "Push-up Master • "}
              {didMartialArts && "Martial Arts Expert"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysicalScreen;