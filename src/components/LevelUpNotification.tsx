import { useEffect, useState } from 'react';
import { Zap, Star, Crown } from 'lucide-react';
import { getPendingLevelUp, clearLevelUpNotification } from '@/utils/levelUpNotification';

const LevelUpNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{newLevel: number, oldLevel: number} | null>(null);

  useEffect(() => {
    const pending = getPendingLevelUp();
    if (pending) {
      setLevelUpData({ newLevel: pending.newLevel, oldLevel: pending.oldLevel });
      setIsVisible(true);
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          clearLevelUpNotification();
          setLevelUpData(null);
        }, 1000);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      clearLevelUpNotification();
      setLevelUpData(null);
    }, 1000);
  };

  if (!levelUpData) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Background Rays */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent animate-[slide-in-right_2s_ease-out] opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-neon-cyan/20 to-transparent animate-[slide-in-right_2.5s_ease-out] opacity-60"></div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center transform transition-all duration-1000 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'
      }`}>
        {/* Level Up Text */}
        <div className="mb-8">
          <div className="text-6xl md:text-8xl font-orbitron font-bold text-neon-cyan glow-text animate-scale-in">
            LEVEL UP!
          </div>
          <div className="text-xl md:text-2xl text-neon-orange font-exo mt-4 animate-fade-in">
            🎉 Congratulations! You've grown stronger! 🎉
          </div>
        </div>

        {/* Level Transition */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Old Level */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-exo mb-2">FROM</div>
            <div className="sci-fi-container w-32 h-32 flex items-center justify-center">
              <div className="text-4xl font-orbitron font-bold text-neon-orange">
                {levelUpData.oldLevel}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center">
            <Zap className="w-8 h-8 text-neon-cyan animate-pulse" />
            <div className="w-16 h-1 bg-gradient-to-r from-neon-cyan to-neon-blue mx-2 animate-pulse"></div>
            <Zap className="w-8 h-8 text-neon-blue animate-pulse" />
          </div>

          {/* New Level */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-exo mb-2">TO</div>
            <div className="sci-fi-container w-32 h-32 flex items-center justify-center border-neon-cyan/70 bg-neon-cyan/10 animate-pulse">
              <div className="text-4xl font-orbitron font-bold text-neon-cyan glow-text">
                {levelUpData.newLevel}
              </div>
              <Crown className="absolute -top-2 -right-2 w-6 h-6 text-neon-orange animate-bounce" />
            </div>
          </div>
        </div>

        {/* Power Level Message */}
        <div className="mb-8">
          <div className="text-lg text-neon-green font-exo animate-fade-in">
            ⚡ Your power level has increased! ⚡
          </div>
          <div className="text-sm text-muted-foreground mt-2 animate-fade-in">
            Continue your journey to become stronger!
          </div>
        </div>

        {/* Stats Boost Visualization */}
        <div className="flex justify-center gap-4 mb-8">
          {['STRENGTH', 'FOCUS', 'WILLPOWER'].map((stat, index) => (
            <div key={stat} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <Star className="w-6 h-6 text-neon-orange mx-auto mb-1 animate-spin" />
              <div className="text-xs text-neon-orange font-orbitron">+{stat}</div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleClose}
          className="neon-button-primary text-lg px-8 py-3 animate-pulse hover:animate-none"
        >
          <Star className="w-5 h-5 mr-2" />
          CONTINUE
        </button>

        {/* Click to Continue Hint */}
        <div className="text-xs text-muted-foreground mt-4 animate-fade-in">
          Click anywhere to continue...
        </div>
      </div>
    </div>
  );
};

export default LevelUpNotification;