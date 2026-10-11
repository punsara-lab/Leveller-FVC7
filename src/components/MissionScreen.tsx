import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import DailyQuestDialog from './DailyQuestDialog';
import { isQuestSystemActive, getDaysUntilQuestStart } from '@/utils/dailyQuestSystem';

const MissionScreen = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [error, setError] = useState<string>('');
  const [questDialogOpen, setQuestDialogOpen] = useState(false);

  // ARD Date: August 1, 2025
  const ardDate = new Date('2025-08-01');
  const today = new Date();

  const handleDateSelect = (date: Date | undefined) => {
    if (date && date < ardDate) {
      setError('⚠️ Cannot select dates before ARD-Date (August 1, 2025)');
      return;
    }
    setError('');
    setSelectedDate(date);
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-orbitron font-bold text-neon-orange glow-text mb-4">
            MISSION CONTROL
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-neon-orange via-neon-cyan to-neon-blue mx-auto rounded-full"></div>
        </div>

        {/* Mission Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Date Information */}
          <div className="space-y-6">
            <div className="sci-fi-container">
              <h3 className="text-xl font-orbitron text-neon-cyan mb-4">📅 MISSION TIMELINE</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ARD-Date:</span>
                  <span className="text-neon-orange font-orbitron font-bold">
                    {formatDate(ardDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Today:</span>
                  <span className="text-neon-cyan font-orbitron font-bold">
                    {formatDate(today)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Selected:</span>
                  <span className="text-foreground font-orbitron font-bold">
                    {selectedDate ? formatDate(selectedDate) : 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <div className="sci-fi-container">
              <h3 className="text-xl font-orbitron text-neon-cyan mb-4">🗓️ SELECT TARGET DATE</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "neon-button-secondary w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? formatDate(selectedDate) : "Pick a date"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-primary/30" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < ardDate}
                    initialFocus
                    className="p-3 pointer-events-auto bg-card border-0"
                  />
                </PopoverContent>
              </Popover>
              
              {error && (
                <div className="mt-4 p-3 bg-destructive/20 border border-destructive/50 rounded-lg">
                  <p className="text-destructive text-sm font-exo">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Mission Status */}
          <div className="sci-fi-container">
            <h3 className="text-xl font-orbitron text-neon-cyan mb-4">🎯 MISSION STATUS</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-sm">System Ready</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-neon-blue rounded-full animate-pulse"></div>
                <span className="text-sm">Spiritual Module Active</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-neon-orange rounded-full animate-pulse"></div>
                <span className="text-sm">Physical Module Active</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-neon-cyan rounded-full animate-pulse"></div>
                <span className="text-sm">Progress Tracking Online</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/20 rounded-lg">
              <h4 className="font-orbitron text-neon-orange mb-2">Daily Objectives</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Complete study session</li>
                <li>• Practice meditation</li>
                <li>• Physical training</li>
                <li>• Dominate</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Daily Quest Section */}
        {isQuestSystemActive() ? (
          <div className="mb-8">
            <div className="sci-fi-container text-center">
              <h3 className="text-2xl font-orbitron text-neon-cyan mb-4 flex items-center justify-center gap-3">
                <Target className="w-6 h-6 animate-pulse" />
                DAILY QUEST SYSTEM
                <Target className="w-6 h-6 animate-pulse" />
              </h3>
              <p className="text-neon-orange mb-6 font-exo">
                Complete daily strength training to level up!
              </p>
              <button
                onClick={() => setQuestDialogOpen(true)}
                className="neon-button-primary text-xl py-4 px-8 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  OPEN DAILY QUEST
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-blue opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="sci-fi-container text-center">
              <h3 className="text-2xl font-orbitron text-muted-foreground mb-4">
                🔒 DAILY QUEST SYSTEM
              </h3>
              <p className="text-neon-orange mb-4 font-exo">
                Quest system activates on August 1, 2025
              </p>
              <p className="text-sm text-muted-foreground">
                {getDaysUntilQuestStart()} days remaining
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/spiritual')}
            className="neon-button-secondary text-xl py-6 group relative overflow-hidden"
          >
            <span className="relative z-10">🧘 SPIRITUAL PROGRESS</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-blue opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={() => navigate('/physical')}
            className="neon-button-accent text-xl py-6 group relative overflow-hidden"
          >
            <span className="relative z-10">💪 PHYSICAL PROGRESS</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-orange to-neon-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="neon-button-primary text-xl py-6 group relative overflow-hidden"
          >
            <span className="relative z-10">📊 PROGRESS REPORTS</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-orange opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/status')}
            className="text-muted-foreground hover:text-neon-cyan transition-colors duration-300 font-exo"
          >
            ← Back to Status
          </button>
        </div>
      </div>

      {/* Daily Quest Dialog */}
      <DailyQuestDialog 
        open={questDialogOpen} 
        onOpenChange={setQuestDialogOpen} 
      />
    </div>
  );
};

export default MissionScreen;
