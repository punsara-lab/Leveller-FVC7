import { useEffect, useState } from 'react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      onComplete();
    }
  }, [countdown, onComplete]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center animated-bg relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-neon-blue/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-neon-cyan/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-40 h-40 bg-neon-orange/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Title with Cycling Colors */}
        <h1 className="text-6xl md:text-8xl font-orbitron font-black tracking-wider animate-text-cycle glow-text">
          ⚔️ WELCOME TO LEVELLER ⚔️
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-exo text-neon-cyan/80 tracking-wide">
          THE ULTIMATE SELF-DEVELOPMENT ARENA
        </p>

        {/* Countdown */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-4xl font-orbitron text-neon-orange font-bold">
            {countdown}
          </div>
          <p className="text-lg text-muted-foreground">
            Auto-starting in {countdown} seconds...
          </p>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="neon-button-accent mt-8"
        >
          ⚡ SKIP INTRO
        </button>
      </div>

      {/* Corner Details */}
      <div className="absolute bottom-4 left-4 text-sm text-muted-foreground font-exo">
        <div>SYSTEM: LEVELLER v1.0</div>
        <div>STATUS: INITIALIZING...</div>
      </div>

      <div className="absolute bottom-4 right-4 text-sm text-muted-foreground font-exo">
        <div>MODE: SOLO LEVELING</div>
        <div>READY: TRUE</div>
      </div>
    </div>
  );
};

export default WelcomeScreen;