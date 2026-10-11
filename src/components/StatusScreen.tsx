import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { getPlayerProgress } from '@/utils/levelSystem';
import { useUserConfig } from '@/hooks/useUserConfig';
import { calculateAge } from '@/config/userConfig';
import LevelUpNotification from '@/components/LevelUpNotification';

const StatusScreen = () => {
  const navigate = useNavigate();
  const config = useUserConfig();
  const playerProgress = getPlayerProgress();
  const [showGlitch, setShowGlitch] = useState(false);

  const handleGlitchClick = (e: React.MouseEvent) => {
    // Check if the clicked element is unclickable (background areas)
    const target = e.target as HTMLElement;
    const clickableElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    const isClickable = clickableElements.includes(target.tagName) || 
                       target.closest('button') || 
                       target.closest('a') ||
                       target.closest('[role="button"]');
    
    if (!isClickable) {
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 200); // Quick glitch effect
    }
  };

  const age = calculateAge(config.birthDate);

  const stats = [
    { label: 'Name', value: config.name || 'Unnamed' },
    ...(age !== null ? [{ label: 'Age', value: `${age} years` }] : []),
    { label: 'Title', value: config.title || 'The One Who Levels Up' },
    { label: 'Focus', value: '100%' },
    { label: 'Strength', value: 'Beginner' },
    { label: 'System', value: 'Activated' },
  ];

  return (
    <>
      <LevelUpNotification />
      <div 
        className="min-h-screen flex items-center justify-center animated-bg p-6 relative"
        onClick={handleGlitchClick}
      >
      {/* Glitch Overlay */}
      {showGlitch && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 font-orbitron text-6xl font-bold opacity-80 animate-ping">
            ERROR
          </div>
          <div className="absolute inset-0 bg-black/20 animate-pulse"></div>
          {/* Glitch lines */}
          <div className="absolute top-[20%] left-0 w-full h-0.5 bg-red-500 animate-ping"></div>
          <div className="absolute top-[40%] left-0 w-full h-0.5 bg-cyan-500 animate-ping delay-75"></div>
          <div className="absolute top-[60%] left-0 w-full h-0.5 bg-red-500 animate-ping delay-150"></div>
          <div className="absolute top-[80%] left-0 w-full h-0.5 bg-cyan-500 animate-ping delay-100"></div>
        </div>
      )}
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-orbitron font-bold text-neon-blue glow-text mb-4">
            PLAYER STATUS
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-orange mx-auto rounded-full"></div>
        </div>

        {/* Solo Leveling Style Level Display */}
        <div className="text-center mb-8">
          <div className="sci-fi-container inline-block">
            <div className="text-6xl font-orbitron font-bold text-neon-blue glow-text mb-2">
              LEVEL {playerProgress.level}
            </div>
            <div className="text-sm text-neon-cyan font-exo">
              ✨ The Hunter Who Never Stops Growing ✨
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="sci-fi-container group hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan/30 to-neon-blue/30 border border-neon-cyan/50 group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-pulse"></div>
                  <div className="absolute top-1 left-1 w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-neon-cyan/80 rounded-full animate-ping"></div>
                </div>
                <div>
                  <div className="text-sm text-neon-cyan font-exo font-medium">
                    {stat.label}
                  </div>
                  <div className="text-xl font-orbitron text-foreground font-bold">
                    {stat.value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily XP Progress Bar */}
        <div className="sci-fi-container mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-orbitron text-neon-cyan">TODAY'S PROGRESS</span>
            <span className="text-lg font-orbitron text-neon-orange">LEVEL {playerProgress.level}</span>
          </div>
          <div className="w-full bg-muted rounded-lg h-4 relative overflow-hidden">
            <div 
              className={`absolute inset-0 rounded-lg transition-all duration-500 ${
                (() => {
                  const today = new Date().toISOString().split('T')[0];
                  const todayLog = playerProgress.dailyLogs.find(log => log.date === today);
                  
                  if (!todayLog) return 'bg-gradient-to-r from-gray-600 to-gray-500 w-0';
                  
                  const spiritualPercent = (todayLog.spiritualMarks / 50) * 100;
                  const physicalPercent = (todayLog.physicalMarks / 50) * 100;
                  const dailyXP = (spiritualPercent + physicalPercent) / 2;
                  
                  const barColor = dailyXP < 15 
                    ? 'bg-gradient-to-r from-red-500 to-red-400 animate-pulse' 
                    : 'bg-gradient-to-r from-neon-blue to-neon-cyan animate-glow-pulse';
                  
                  return `${barColor}`;
                })()
              }`}
              style={{
                width: (() => {
                  const today = new Date().toISOString().split('T')[0];
                  const todayLog = playerProgress.dailyLogs.find(log => log.date === today);
                  
                  if (!todayLog) return '0%';
                  
                  const spiritualPercent = (todayLog.spiritualMarks / 50) * 100;
                  const physicalPercent = (todayLog.physicalMarks / 50) * 100;
                  const dailyXP = (spiritualPercent + physicalPercent) / 2;
                  
                  return `${Math.min(dailyXP, 100)}%`;
                })()
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-orbitron font-bold text-primary-foreground">
                {(() => {
                  const today = new Date().toISOString().split('T')[0];
                  const todayLog = playerProgress.dailyLogs.find(log => log.date === today);
                  
                  if (!todayLog) return '0%';
                  
                  const spiritualPercent = (todayLog.spiritualMarks / 50) * 100;
                  const physicalPercent = (todayLog.physicalMarks / 50) * 100;
                  const dailyXP = (spiritualPercent + physicalPercent) / 2;
                  
                  return `${Math.round(dailyXP)}%`;
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Mission Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/mission')}
            className="neon-button text-2xl px-12 py-4 group relative overflow-hidden"
          >
            <span className="relative z-10">▶ START MISSION</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-6 mt-12">
          <div className="sci-fi-container">
            <h3 className="text-lg font-orbitron text-neon-cyan mb-2">RECENT ACHIEVEMENTS</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>🏆 First Login Streak</div>
              <div>📖 Study Session Complete</div>
              <div>🧘 Meditation Master</div>
            </div>
          </div>
          
          <div className="sci-fi-container">
            <h3 className="text-lg font-orbitron text-neon-orange mb-2">SYSTEM STATUS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>System Health:</span>
                <span className="text-neon-green">OPTIMAL</span>
              </div>
              <div className="flex justify-between">
                <span>Connection:</span>
                <span className="text-neon-green">STABLE</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="text-neon-cyan">DEVELOPMENT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default StatusScreen;