import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Target, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getDailyQuestProgress, 
  saveDailyQuestProgress, 
  calculateDailyQuestTargets,
  completeDailyQuest,
  DailyQuestProgress 
} from '@/utils/dailyQuestSystem';
import { getSharedExerciseData, updateSharedExerciseData } from '@/utils/sharedExerciseData';

interface DailyQuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DailyQuestDialog = ({ open, onOpenChange }: DailyQuestDialogProps) => {
  const [questProgress, setQuestProgress] = useState<DailyQuestProgress | null>(null);
  const [completedValues, setCompletedValues] = useState({
    pushUps: 0,
    sitUps: 0,
    squats: 0,
    running: 0
  });
  const [penaltyCompleted, setPenaltyCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (open) {
      const progress = getDailyQuestProgress();
      setQuestProgress(progress);
      
      const today = new Date().toISOString().split('T')[0];
      const todayQuest = progress.completedQuests.find(q => q.date === today);
      
      if (todayQuest) {
        setCompletedValues({
          pushUps: todayQuest.completed.pushUps,
          sitUps: todayQuest.completed.sitUps,
          squats: todayQuest.completed.squats,
          running: todayQuest.completed.running
        });
        setPenaltyCompleted(todayQuest.penaltyCompleted || false);
      } else {
        // Load from shared exercise data if quest not completed
        const sharedData = getSharedExerciseData();
        const todayData = sharedData.lastUpdated === today ? sharedData : {
          pushUps: 0, sitUps: 0, squats: 0, running: 0
        };
        setCompletedValues({
          pushUps: todayData.pushUps,
          sitUps: todayData.sitUps,
          squats: todayData.squats,
          running: todayData.running
        });
      }
    }
  }, [open]);

  // Countdown timer effect
  useEffect(() => {
    if (!open) return;

    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [open]);

  if (!questProgress) return null;

  const today = new Date().toISOString().split('T')[0];
  const { targets, penalty } = calculateDailyQuestTargets();
  const todayQuest = questProgress.completedQuests.find(q => q.date === today);
  const isCompleted = todayQuest?.isCompleted || false;

  const handleInputChange = (field: keyof typeof completedValues, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    const newValues = { ...completedValues, [field]: numValue };
    setCompletedValues(newValues);
    
    // Update shared exercise data
    updateSharedExerciseData({
      pushUps: newValues.pushUps,
      sitUps: newValues.sitUps,
      squats: newValues.squats,
      running: newValues.running
    }, 'dailyQuest');
  };

  const handleMarkAllFinish = () => {
    const newValues = {
      pushUps: targets.pushUps,
      sitUps: targets.sitUps,
      squats: targets.squats,
      running: targets.running
    };
    setCompletedValues(newValues);
    
    // Update shared exercise data
    updateSharedExerciseData(newValues, 'dailyQuest');
    
    toast.success("✅ All targets marked as completed!");
  };

  const handleSubmit = () => {
    const isComplete = 
      completedValues.pushUps >= targets.pushUps &&
      completedValues.sitUps >= targets.sitUps &&
      completedValues.squats >= targets.squats &&
      completedValues.running >= targets.running;

    if (!isComplete) {
      toast.error("⚠️ Quest not completed! Complete all targets to proceed.");
      return;
    }

    const result = completeDailyQuest(completedValues);
    
    if (result.levelGained > 0) {
      toast.success(`🎉 Daily Quest Completed! +${result.levelGained} LEVEL! Now Level ${result.newLevel}`);
    } else {
      toast.success(`✅ Daily Quest Completed! (Progress toward next level)`);
    }

    setQuestProgress(getDailyQuestProgress());
    onOpenChange(false);
  };

  const getProgressPercentage = (completed: number, target: number) => {
    return Math.min((completed / target) * 100, 100);
  };

  const getProgressColor = (completed: number, target: number) => {
    const percentage = getProgressPercentage(completed, target);
    if (percentage >= 100) return 'text-neon-green';
    if (percentage >= 50) return 'text-neon-orange';
    return 'text-destructive';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] bg-card/95 border-primary/30 backdrop-blur-sm flex flex-col p-0">
        <DialogHeader className="space-y-4 p-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-neon-cyan" />
              <DialogTitle className="text-2xl font-orbitron text-neon-cyan">
                QUEST INFO
              </DialogTitle>
            </div>
            
            {/* Countdown Timer Circle */}
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="hsl(var(--destructive))"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * ((timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds) / (24 * 3600))}`}
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: 'drop-shadow(0 0 8px hsl(var(--destructive) / 0.5))'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Clock className="w-4 h-4 text-destructive" />
              </div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-neon-orange font-exo">
              Daily Quest: Strength Training has arrived!
            </p>
            <div className="text-sm text-destructive font-orbitron">
              Time Remaining: {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-6 p-6 pt-0">
            {/* Penalty Section */}
            {penalty && (
              <div className="flex items-center gap-3 p-4 bg-amber-500/20 border border-amber-500/50 rounded-lg mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-amber-500 font-semibold">PENALTY TASK (Optional):</p>
                  <p className="text-muted-foreground text-sm">{penalty.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={penaltyCompleted}
                    onChange={(e) => setPenaltyCompleted(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-amber-500"
                    disabled={isCompleted}
                  />
                  <span className={`text-sm ${penaltyCompleted ? 'text-neon-green' : 'text-amber-500'}`}>
                    {penaltyCompleted ? 'Completed!' : 'Complete?'}
                  </span>
                </div>
              </div>
            )}

            {/* Goals Section */}
            <div className="sci-fi-container">
              <h3 className="text-xl font-orbitron text-neon-cyan mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                MAIN QUEST
              </h3>
              
              <div className="space-y-4">
                {/* Push-ups */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">Push-ups</span>
                    <span className={`font-orbitron ${getProgressColor(completedValues.pushUps, targets.pushUps)}`}>
                      [{completedValues.pushUps}/{targets.pushUps}]
                    </span>
                    {completedValues.pushUps >= targets.pushUps && <CheckCircle2 className="w-5 h-5 text-neon-green" />}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={completedValues.pushUps}
                    onChange={(e) => handleInputChange('pushUps', e.target.value)}
                    className="w-20 text-center bg-background/50"
                    disabled={isCompleted}
                  />
                </div>

                {/* Sit-ups */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">Sit-ups</span>
                    <span className={`font-orbitron ${getProgressColor(completedValues.sitUps, targets.sitUps)}`}>
                      [{completedValues.sitUps}/{targets.sitUps}]
                    </span>
                    {completedValues.sitUps >= targets.sitUps && <CheckCircle2 className="w-5 h-5 text-neon-green" />}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={completedValues.sitUps}
                    onChange={(e) => handleInputChange('sitUps', e.target.value)}
                    className="w-20 text-center bg-background/50"
                    disabled={isCompleted}
                  />
                </div>

                {/* Squats */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">Squats</span>
                    <span className={`font-orbitron ${getProgressColor(completedValues.squats, targets.squats)}`}>
                      [{completedValues.squats}/{targets.squats}]
                    </span>
                    {completedValues.squats >= targets.squats && <CheckCircle2 className="w-5 h-5 text-neon-green" />}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={completedValues.squats}
                    onChange={(e) => handleInputChange('squats', e.target.value)}
                    className="w-20 text-center bg-background/50"
                    disabled={isCompleted}
                  />
                </div>

                {/* Running */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">Running</span>
                    <span className={`font-orbitron ${getProgressColor(completedValues.running, targets.running)}`}>
                      [{completedValues.running}/{targets.running}]km
                    </span>
                    {completedValues.running >= targets.running && <CheckCircle2 className="w-5 h-5 text-neon-green" />}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={completedValues.running}
                    onChange={(e) => handleInputChange('running', e.target.value)}
                    className="w-20 text-center bg-background/50"
                    disabled={isCompleted}
                  />
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-center gap-3 p-4 bg-destructive/20 border border-destructive/50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div className="text-sm">
                <p className="text-destructive font-semibold">WARNING:</p>
                <p className="text-muted-foreground">
                  Failure to complete the daily quest will result in an appropriate <span className="text-destructive">penalty</span>.
                </p>
              </div>
            </div>

            {/* Level System Info */}
            <div className="flex items-center gap-3 p-4 bg-neon-cyan/20 border border-neon-cyan/50 rounded-lg">
              <Target className="w-5 h-5 text-neon-cyan" />
              <div className="text-sm">
                <p className="text-neon-cyan font-semibold">LEVEL SYSTEM:</p>
                <p className="text-muted-foreground">
                  Complete daily quest + spiritual/physical progress for level advancement.
                  Higher levels require more consecutive days and higher percentages.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 items-center">
              {!isCompleted && (
                <Button
                  onClick={handleMarkAllFinish}
                  variant="outline"
                  className="w-full max-w-md border-neon-orange text-neon-orange hover:bg-neon-orange/20"
                >
                  <Target className="w-4 h-4 mr-2" />
                  MARK ALL FINISH
                </Button>
              )}
              
              {isCompleted ? (
                <div className="flex items-center gap-2 text-neon-green">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-orbitron">Quest Completed Today!</span>
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="neon-button-primary text-lg px-8 py-4"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  COMPLETE QUEST
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DailyQuestDialog;