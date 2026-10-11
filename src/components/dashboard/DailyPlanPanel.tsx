import { useMemo } from 'react';
import { Download, Clock, BookOpen, Dumbbell, Brain, Coffee, Moon, School, Flame, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { buildDailySchedule, dailyTargets, type PlanBlock } from '@/utils/autoPlan';
import { useUserConfig } from '@/hooks/useUserConfig';

const ICONS: Record<PlanBlock['icon'], any> = {
  book: BookOpen, dumbbell: Dumbbell, school: School, coffee: Coffee, moon: Moon, eye: Eye, flame: Flame,
};

const DailyPlanPanel = () => {
  const cfg = useUserConfig();
  const weekday = useMemo(() => new Date().getDay(), []);
  const schedule = useMemo(() => buildDailySchedule(cfg, weekday), [cfg, weekday]);
  const targets = useMemo(() => dailyTargets(cfg), [cfg]);

  const generatePlanText = () => {
    const today = format(new Date(), 'EEEE, MMMM d, yyyy');
    const studyH = (targets.studyMin / 60).toFixed(1);
    const trainM = targets.trainMin;
    let t = `FVC7 PROTOCOL — DAILY PLAN (auto-adjusted)\n`;
    t += `Date: ${today}\nGoal: ${cfg.primaryGoal} · Level: ${cfg.fitnessLevel}\n`;
    t += `Sleep: ${cfg.sleep.wake} → ${cfg.sleep.bed}\n`;
    t += `═══════════════════════════════════════\n\n`;
    t += `SCHEDULE\n───────────────────────────────────────\n\n`;
    schedule.forEach(b => {
      t += `${b.start} – ${b.end} (${b.durationMin} min)\n`;
      t += `  ${b.label}` + (b.detail && b.detail !== '-' ? ` · ${b.detail}` : '') + `\n`;
      t += `  → ${b.strategy}\n\n`;
    });
    t += `───────────────────────────────────────\n`;
    t += `TODAY'S TARGETS (${studyH}h study · ${trainM} min train):\n`;
    targets.lines.forEach(l => (t += `□ ${l}\n`));
    t += `\n"Daily Execution Determines Destiny."\n`;
    t += `═══════════════════════════════════════\n`;
    return t;
  };

  const download = (name: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadDaily = () => download(`FVC7_Daily_Plan_${format(new Date(), 'yyyy-MM-dd')}.txt`, generatePlanText());

  const downloadWeekly = () => {
    const start = new Date();
    let w = `FVC7 PROTOCOL — WEEKLY PLAN (auto-adjusted)\nWeek Starting: ${format(start, 'MMMM d, yyyy')}\n`;
    w += `Goal: ${cfg.primaryGoal} · Level: ${cfg.fitnessLevel}\n`;
    w += `═══════════════════════════════════════════════\n\n`;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysIdx = [1, 2, 3, 4, 5, 6, 0];
    const subjs = cfg.studySubjects?.length ? cfg.studySubjects : ['Biology', 'Chemistry', 'Physics'];
    days.forEach((d, i) => {
      const daySched = buildDailySchedule(cfg, daysIdx[i]);
      const studyMin = daySched.filter(b => b.kind === 'study').reduce((a, b) => a + b.durationMin, 0);
      const trainMin = daySched.filter(b => b.kind === 'train').reduce((a, b) => a + b.durationMin, 0);
      const focus = subjs[i % subjs.length];
      w += `${d.toUpperCase()}\n`;
      w += `─────────────────────────────────\n`;
      w += `  Study focus → ${focus}\n`;
      w += `  Study: ${(studyMin / 60).toFixed(1)}h · Train: ${trainMin} min\n`;
      w += `  Wind-down ${cfg.sleep.bed} · Wake ${cfg.sleep.wake}\n\n`;
    });
    w += `═══════════════════════════════════════════════\n`;
    w += `WEEKLY TARGETS:\n`;
    targets.lines.forEach(l => (w += `□ 7× ${l.replace(/^\d+ ?/, '')}\n`));
    w += `═══════════════════════════════════════════════\n`;
    download(`FVC7_Weekly_Plan_${format(new Date(), 'yyyy-MM-dd')}.txt`, w);
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Daily Plan · Auto-adjusted
        </h3>
        <div className="flex gap-2">
          <button onClick={downloadDaily}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg transition-colors text-primary">
            <Download className="w-3 h-3" /> Daily
          </button>
          <button onClick={downloadWeekly}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-accent/20 hover:bg-accent/30 border border-accent/30 rounded-lg transition-colors text-accent">
            <Download className="w-3 h-3" /> Weekly
          </button>
        </div>
      </div>
      <div className="text-[11px] text-muted-foreground mb-3 bg-muted/10 border border-primary/10 rounded-lg px-3 py-1.5 inline-block">
        {cfg.sleep.wake} → {cfg.sleep.bed} · Goal: {cfg.primaryGoal} · Level: {cfg.fitnessLevel}
        {cfg.workOrSchool && cfg.obligation.enabled && ` · Obligation ${cfg.obligation.start}–${cfg.obligation.end}`}
      </div>
      <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
        {schedule.map((b, i) => {
          const Icon = ICONS[b.icon] ?? BookOpen;
          return (
            <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/10 border border-primary/5 hover:border-primary/20 transition-colors">
              <div className={`p-1.5 rounded-lg bg-muted/20 ${b.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{b.label}</span>
                  <span className="text-[10px] text-muted-foreground">{b.start}–{b.end}</span>
                </div>
                {b.detail && b.detail !== '-' && <span className="text-[10px] text-primary">{b.detail}</span>}
                <p className="text-[10px] text-muted-foreground truncate">{b.strategy}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-[11px] text-muted-foreground flex items-center gap-2">
        <Brain className="w-3.5 h-3.5 text-primary" />
        Personalized blocks scaled from onboarding answers — edit anytime via Settings.
      </div>
    </div>
  );
};

export default DailyPlanPanel;
