import { useEffect, useState } from 'react';

interface ProfessionalWelcomeScreenProps {
  onComplete: () => void;
}

const ProfessionalWelcomeScreen = ({ onComplete }: ProfessionalWelcomeScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-midnight-blue/20 to-background relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-electric-blue/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-float delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center space-y-8 animate-professional-slide">
        {/* Clean Logo/Icon */}
        <div className="w-20 h-20 mx-auto mb-8 relative">
          <div className="w-full h-full bg-gradient-to-br from-electric-blue to-accent rounded-xl animate-blue-glow flex items-center justify-center">
            <div className="text-2xl font-bold text-background">F</div>
          </div>
        </div>
        
        {/* Simple Title */}
        <h1 className="text-4xl font-bold tracking-wide text-foreground">
          FVC7
        </h1>
        
        {/* Minimal Subtitle */}
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Local-First Discipline Protocol
        </p>

        {/* Professional Progress Bar */}
        <div className="w-80 mx-auto mt-12">
          <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-electric-blue to-accent transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Initializing... {progress}%
          </p>
        </div>
      </div>

      {/* Clean Footer */}
      <div className="absolute bottom-8 text-xs text-muted-foreground">
        System Ready
      </div>
    </div>
  );
};

export default ProfessionalWelcomeScreen;