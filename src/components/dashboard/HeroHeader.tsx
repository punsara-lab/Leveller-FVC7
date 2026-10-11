import { useState, useEffect } from 'react';
import { Zap, Shield, Swords } from 'lucide-react';

const HeroHeader = () => {
  const [glowIntensity, setGlowIntensity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card/80 to-primary/10 border border-primary/20 p-8 mb-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div 
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"
          style={{ opacity: 0.3 + Math.sin(glowIntensity * 0.1) * 0.2 }}
        />
        <div 
          className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s', opacity: 0.2 + Math.cos(glowIntensity * 0.08) * 0.15 }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Animated lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
      </div>

      {/* Knight Silhouette / Energy Aura */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
        <div className="relative">
          {/* Energy aura effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-primary via-accent to-transparent rounded-full blur-2xl animate-pulse"
            style={{ 
              width: '150px', 
              height: '200px',
              opacity: 0.4 + Math.sin(glowIntensity * 0.05) * 0.2
            }}
          />
          <Shield 
            className="w-32 h-32 text-primary"
            style={{
              filter: `drop-shadow(0 0 ${10 + Math.sin(glowIntensity * 0.1) * 5}px hsl(var(--primary)))`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-accent animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Mission Control Active
            </span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
            FVC7 Command Deck
          </span>
        </h1>

        <p className="text-muted-foreground text-lg font-medium italic max-w-xl">
          "Daily Execution Determines Destiny."
        </p>

        {/* Status indicators */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Tracking Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-muted-foreground">Data Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroHeader;
