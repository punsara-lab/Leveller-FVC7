import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  calculateSpiritualMarks, 
  getPlayerProgress, 
  savePlayerProgress, 
  canUseRestDay,
  getRestDayBonus,
  checkLevelUp,
  type DailyLog 
} from '@/utils/levelSystem';

const SpiritualScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [studyHours, setStudyHours] = useState<number>(0);
  const [meditationMinutes, setMeditationMinutes] = useState<number>(0);
  const [didSpecial, setDidSpecial] = useState<boolean>(false);
  const [specialDescription, setSpecialDescription] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [natureTimeMinutes, setNatureTimeMinutes] = useState<number>(0);
  const [currentQuote, setCurrentQuote] = useState<string>('');
  const [isRestDay, setIsRestDay] = useState<boolean>(false);
  
  const playerProgress = getPlayerProgress();

  const quotes = [
    "Silence is a source of great strength.",
    "The soul always knows what to do to heal itself.",
    "Meditation is not evasion; it is a serene encounter with reality.",
    "Knowing yourself is the beginning of all wisdom."
  ];

  useEffect(() => {
    // Randomly select a quote on component mount
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
  }, []);

  const canUseRestDayToday = canUseRestDay('spiritual', playerProgress.lastSpiritualRestDay);

  const handleSubmit = async () => {
    const today = new Date().toISOString().split('T')[0];
    let marks = 0;
    
    if (isRestDay && canUseRestDayToday) {
      marks = getRestDayBonus();
      playerProgress.lastSpiritualRestDay = today;
      
      toast({
        title: "⚠️ Rest Day Activated",
        description: `You used your spiritual rest day. Next available in 14 days. +${marks} bonus marks!`,
      });
    } else if (isRestDay && !canUseRestDayToday) {
      toast({
        title: "❌ Rest Day Not Available",
        description: "You can only use a spiritual rest day once every 14 days!",
      });
      return;
    } else {
      marks = calculateSpiritualMarks(studyHours, meditationMinutes, didSpecial, natureTimeMinutes);
    }
    
    // Create daily log
    const dailyLog: DailyLog = {
      date: today,
      spiritualMarks: marks,
      physicalMarks: 0, // Will be updated when physical is logged
      totalMarks: marks,
      isRestDay: isRestDay,
      restDayType: isRestDay ? 'spiritual' : undefined
    };
    
    // Update existing physical log if it exists for today
    const existingLogIndex = playerProgress.dailyLogs.findIndex(log => log.date === today);
    if (existingLogIndex >= 0) {
      playerProgress.dailyLogs[existingLogIndex].spiritualMarks = marks;
      playerProgress.dailyLogs[existingLogIndex].totalMarks = 
        playerProgress.dailyLogs[existingLogIndex].physicalMarks + marks;
    } else {
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
    
    // Legacy spiritual logs
    const logData = {
      date: today,
      studyHours,
      meditationMinutes,
      didSpecial,
      specialDescription: didSpecial ? specialDescription : '',
      specialNotes,
      natureTimeMinutes,
      totalCredits: marks,
      isRestDay,
      timestamp: new Date().toISOString()
    };

    const existingLogs = JSON.parse(localStorage.getItem('spiritualLogs') || '[]');
    const updatedLogs = [...existingLogs, logData];
    localStorage.setItem('spiritualLogs', JSON.stringify(updatedLogs));

    if (!isRestDay) {
      toast({
        title: "✨ Spiritual Progress Logged!",
        description: `You earned ${marks} marks today. Keep growing!`,
      });
    }

    // Reset form
    setStudyHours(0);
    setMeditationMinutes(0);
    setDidSpecial(false);
    setSpecialDescription('');
    setSpecialNotes('');
    setNatureTimeMinutes(0);
    setIsRestDay(false);
    
    setTimeout(() => {
      navigate('/mission');
    }, 2000);
  };

  const totalCredits = isRestDay ? getRestDayBonus() : calculateSpiritualMarks(studyHours, meditationMinutes, didSpecial, natureTimeMinutes);

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-orbitron font-bold text-neon-cyan glow-text mb-4">
            SPIRITUAL PROGRESS
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple mx-auto rounded-full"></div>
        </div>

        {/* Motivational Quote */}
        <div className="sci-fi-container mb-8 text-center">
          <div className="text-2xl font-exo italic text-neon-purple glow-text mb-2">
            "{currentQuote}"
          </div>
          <div className="text-sm text-muted-foreground">— Ancient Wisdom</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="sci-fi-container">
              <h3 className="text-xl font-orbitron text-neon-cyan mb-6">📊 TODAY'S ACTIVITIES</h3>
              
              {/* Study Hours */}
              <div className="mb-6">
                <label className="block text-sm font-orbitron text-neon-blue mb-2">
                  📚 Hours Studied
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="sci-fi-input w-full"
                  placeholder="Enter hours..."
                />
              </div>

              {/* Meditation Minutes */}
              <div className="mb-6">
                <label className="block text-sm font-orbitron text-neon-blue mb-2">
                  🧘 Minutes Meditated
                </label>
                <input
                  type="number"
                  min="0"
                  max="1440"
                  value={meditationMinutes}
                  onChange={(e) => setMeditationMinutes(Number(e.target.value))}
                  className="sci-fi-input w-full"
                  placeholder="Enter minutes..."
                />
              </div>

              {/* Nature Time */}
              <div className="mb-6">
                <label className="block text-sm font-orbitron text-neon-green mb-2">
                  🌿 Screen-Free Nature Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1440"
                  value={natureTimeMinutes}
                  onChange={(e) => setNatureTimeMinutes(Number(e.target.value))}
                  className="sci-fi-input w-full"
                  placeholder="Enter minutes away from screens in nature..."
                />
                <div className="text-xs text-neon-green/80 mt-1">
                  ≥20 minutes gives +10% bonus to total spiritual marks
                </div>
              </div>

              {/* Special Activity Checkbox */}
              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={didSpecial}
                    onChange={(e) => setDidSpecial(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-neon-purple bg-transparent checked:bg-neon-purple"
                  />
                  <span className="text-sm font-orbitron text-neon-purple">
                    ✨ Did something spiritually special?
                  </span>
                </label>
              </div>

              {/* Special Description */}
              {didSpecial && (
                <div className="mb-6">
                  <label className="block text-sm font-orbitron text-neon-purple mb-2">
                    📝 Write about it
                  </label>
                  <textarea
                    value={specialDescription}
                    onChange={(e) => setSpecialDescription(e.target.value)}
                    className="sci-fi-input w-full h-24 resize-none"
                    placeholder="Describe your special spiritual activity..."
                  />
                </div>
              )}

              {/* Special Notes */}
              <div className="mb-6">
                <label className="block text-sm font-orbitron text-neon-cyan mb-2">
                  📋 Special Notes (No marks)
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="sci-fi-input w-full h-20 resize-none"
                  placeholder="Write any special thoughts or reflections..."
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
                    ? `Available! Get ${getRestDayBonus()} bonus marks. Next available in 14 days.`
                    : "Not available yet. Available once every 14 days."
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Credits Calculation */}
          <div className="space-y-6">
            <div className="sci-fi-container">
              <h3 className="text-xl font-orbitron text-neon-orange mb-6">💎 CREDITS CALCULATION</h3>
              
              <div className="space-y-4">
                {isRestDay ? (
                  <div className="flex justify-between items-center p-3 bg-neon-orange/20 rounded-lg">
                    <span className="text-sm">Rest Day Bonus:</span>
                    <span className="font-orbitron text-neon-orange">{getRestDayBonus()}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm">Study Marks:</span>
                      <span className="font-orbitron text-neon-blue">{studyHours * 10}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm">Meditation Marks:</span>
                      <span className="font-orbitron text-neon-cyan">
                        {meditationMinutes <= 30 ? meditationMinutes : 30 + Math.floor((meditationMinutes - 30) / 15)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm">Special Bonus:</span>
                      <span className="font-orbitron text-neon-purple">{didSpecial ? 10 : 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <span className="text-sm">Nature Bonus:</span>
                      <span className="font-orbitron text-neon-green">
                        {natureTimeMinutes >= 20 ? '+10%' : '0%'}
                      </span>
                    </div>
                  </>
                )}
                
                <div className="border-t border-primary/30 pt-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 rounded-lg">
                    <span className="text-lg font-orbitron text-neon-orange">TOTAL MARKS:</span>
                    <span className="text-2xl font-orbitron font-bold text-neon-orange glow-text">
                      {totalCredits}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Ring Visualization */}
            <div className="sci-fi-container text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                <div 
                  className="absolute inset-0 rounded-full border-4 border-neon-cyan animate-glow-pulse"
                  style={{
                    background: `conic-gradient(from 0deg, hsl(var(--neon-cyan)) ${Math.min(totalCredits * 3.6, 360)}deg, transparent 0deg)`
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-orbitron font-bold text-neon-cyan">
                    {totalCredits}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total Marks Today</p>
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
            className="flex-1 neon-button py-4 group relative overflow-hidden"
            disabled={!isRestDay && studyHours === 0 && meditationMinutes === 0}
          >
            <span className="relative z-10">
              {isRestDay ? '🛌 SUBMIT REST DAY' : '✨ SUBMIT PROGRESS'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpiritualScreen;