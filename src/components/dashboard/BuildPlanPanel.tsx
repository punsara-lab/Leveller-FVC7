import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Flame, Target, Utensils, Swords, CheckCircle2, Circle, CalendarDays, Download } from 'lucide-react';
import { NON_NEGOTIABLES, getBuildStart, getBuildDeadline, getTotalWeeks, getCurrentPhase, getWeekNumber, isDeload, dayDiff, PHASE_FRACTIONS, type Phase, type WorkoutDay, type Exercise } from '@/data/buildPlan';
import { useUserConfig } from '@/hooks/useUserConfig';
import { todayWorkout, scaleWorkoutFor, type ScaledDay } from '@/utils/autoPlan';
import { cn } from '@/lib/utils';

const STORE_KEY = 'fvc7_build_log';
type Log = Record<string, string[]>;

// Merge auto-adjusted scaled days with the buildPlan phase infrastructure
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const TEMPLATES = [
  { id: 1, name: 'Foundation',
    objective: 'Build the training habit, learn correct movement, start eating in a real caloric surplus. Consistency, not intensity.',
    nutrition: 'Caloric surplus: rice, dhal, eggs, milk powder, bananas + peanuts, chicken 2–3×/week. ~0.7–1g protein per lb of goal bodyweight.',
    martialArts: 'Shadowboxing + footwork only so you are not starting from zero later.',
    milestone: 'Full-body strength baseline established, weight trending up, all exercises noticeably easier than week 1.' },
  { id: 2, name: 'Progression',
    objective: 'Bodyweight alone gets too easy — add resistance and harder variations. Begin martial arts if a gym becomes accessible.',
    nutrition: 'Same surplus approach. Reassess intake if weight gain has stalled or gone too fast.',
    martialArts: 'Start now if possible — Muay Thai, Boxing, or BJJ. 2×/week, adjust volume so recovery does not suffer.',
    milestone: 'Visibly more muscle, using added resistance regularly, martial arts fundamentals underway.' },
  { id: 3, name: 'Refinement',
    objective: 'Sharpen the aesthetic — shoulders, arms, core — while maintaining strength and martial arts progress. Final stretch.',
    nutrition: 'Final 6–8 weeks: keep protein high, trim excess surplus for visible definition by deadline.',
    martialArts: '2–3×/week if accessible. Balance weekly volume to avoid overtraining. Deload every 5th week.',
    milestone: 'Lean-athletic-muscular look achieved, all movements at advanced difficulty, functional martial arts skill.' },
];

const buildPhasesAuto = (cfg: ReturnType<typeof useUserConfig>, week: number): Phase[] => {
  const start = new Date(getBuildStart()).getTime();
  const span = Math.max(86400000, new Date(getBuildDeadline()).getTime() - start);
  const scaled = scaleWorkoutFor(cfg, week);
  const DAYMAP = [1, 3, 5, 6, 2, 4];
  return TEMPLATES.map((tpl, i) => {
    const [a, b] = PHASE_FRACTIONS[i] ?? [0, 1];
    const isLast = i === TEMPLATES.length - 1;
    const workouts: WorkoutDay[] = scaled.slice(0, tpl.id === 1 ? 3 : tpl.id === 2 ? 4 : 5).map((sd: ScaledDay, idx): WorkoutDay => {
      const d = DAYMAP[idx] ?? 1;
      const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const exercises: Exercise[] = sd.exercises.map(e => ({ name: e.name, target: e.target }));
      return { day: d, label: names[d] || 'Day', focus: sd.focus, exercises };
    });
    return {
      id: tpl.id, name: tpl.name,
      start: isoDay(start + span * a),
      end: isoDay(start + span * b - (isLast ? 0 : 86400000)),
      objective: tpl.objective, nutrition: tpl.nutrition,
      martialArts: cfg.martialInterest === 'none' ? 'Not started — shadowbox + footwork only.' : tpl.martialArts,
      milestone: tpl.milestone, workouts,
    } as Phase;
  });
};

const BuildPlanPanel = () => {
  const config = useUserConfig();
  const now = useMemo(() => new Date(), []);
  const week = getWeekNumber(now);
  const PHASES = useMemo(() => buildPhasesAuto(config, week), [config, week]);
  const BUILD_START = getBuildStart();
  const BUILD_DEADLINE = getBuildDeadline();
  const totalWeeks = getTotalWeeks();
  const dateKey = format(now, 'yyyy-MM-dd');
  const phase = useMemo(() => {
    const t = now.getTime();
    return PHASES.find(p => t >= new Date(p.start).getTime() && t <= new Date(p.end + 'T23:59:59').getTime()) ?? (t < new Date(BUILD_START).getTime() ? PHASES[0] : PHASES[PHASES.length - 1]);
  }, [PHASES, BUILD_START]);
  const deload = isDeload(now);
  const daysLeft = Math.max(0, dayDiff(now, new Date(BUILD_DEADLINE)));
  const daysToExam = config.examDate ? Math.max(0, dayDiff(now, new Date(config.examDate))) : null;
  const daysIn = Math.max(0, dayDiff(new Date(BUILD_START), now));
  const progress = Math.min(100, (daysIn / (daysIn + daysLeft || 1)) * 100);

  const [selectedPhase, setSelectedPhase] = useState(phase.id);
  const [log, setLog] = useState<Log>({});

  useEffect(() => { const raw = localStorage.getItem(STORE_KEY); if (raw) setLog(JSON.parse(raw)); }, []);
  const done = log[dateKey] ?? [];
  const toggle = (name: string) => {
    const next = { ...log, [dateKey]: done.includes(name) ? done.filter(n => n !== name) : [...done, name] };
    setLog(next); localStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  const activePhase = PHASES.find(p => p.id === selectedPhase) ?? phase;
  const todayWork = todayWorkout(config, now.getDay());

  const downloadPlan = () => {
    let t = `FVC7 — THE BUILD (auto-adjusted · ${config.fitnessLevel} · ${config.primaryGoal})\n`;
    t += `Start ${BUILD_START} → Deadline ${BUILD_DEADLINE} (${totalWeeks} weeks)\n`;
    t += `User: ${config.name} · Current: Week ${week}/${totalWeeks} · Phase ${phase.id} ${phase.name} · ${daysLeft} days left\n\n`;
    PHASES.forEach(p => {
      t += `PHASE ${p.id} — ${p.name.toUpperCase()} (${p.start} → ${p.end})\n`;
      t += `Objective: ${p.objective}\nNutrition: ${p.nutrition}\nMartial Arts: ${p.martialArts}\nMilestone: ${p.milestone}\n\n`;
      p.workouts.forEach(w => {
        t += `  ${w.label} — ${w.focus}\n`;
        w.exercises.forEach(e => (t += `    - ${e.name}: ${e.target}\n`));
      });
      t += `\n`;
    });
    t += `NON-NEGOTIABLES\n`; NON_NEGOTIABLES.forEach(n => (t += `- ${n}\n`));
    const blob = new Blob([t], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `FVC7_The_Build_${dateKey}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">The Build · Auto-adjusted</div>
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {totalWeeks}-Week {config.primaryGoal} Protocol
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(BUILD_START), 'MMM d, yyyy')} → {format(new Date(BUILD_DEADLINE), 'MMM d, yyyy')}
              </p>
              {config.examDate && (
                <p className="text-xs text-accent mt-1">
                  {config.examLabel || 'Exam'} on {format(new Date(config.examDate), 'MMM d, yyyy')} — body and books run on one clock.
                </p>
              )}
            </div>
            <button onClick={downloadPlan} className="flex items-center gap-2 px-3 py-2 text-xs bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-primary transition-colors">
              <Download className="w-3.5 h-3.5" /> Export Plan
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
            {[
              { label: 'Days Left', value: daysLeft },
              { label: 'Week', value: `${week}/${totalWeeks}` },
              { label: 'Phase', value: `${phase.id} · ${phase.name}` },
              { label: 'Mode', value: deload ? 'Deload' : 'Overload' },
              ...(daysToExam !== null ? [{ label: `${config.examLabel || 'Exam'} In`, value: `${daysToExam}d` }] : []),
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-muted/20 border border-primary/10">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="text-lg font-bold text-foreground">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 h-2 rounded-full bg-muted/30 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-primary" />
          Today — {format(now, 'EEEE, MMM d')}
        </h3>
        {todayWork ? (
          <>
            <div className="text-sm text-primary font-medium mb-3">{todayWork.focus} · ~{todayWork.cardioMin} min cardio</div>
            <div className="space-y-2">
              {todayWork.exercises.map(ex => {
                const isDone = done.includes(ex.name);
                return (
                  <button key={ex.name} onClick={() => toggle(ex.name)}
                    className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      isDone ? 'bg-primary/15 border-primary/40' : 'bg-muted/10 border-primary/10 hover:border-primary/30')}>
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <span className={cn('text-sm', isDone && 'line-through text-muted-foreground')}>{ex.name}</span>
                      <div className="text-[10px] text-muted-foreground">{ex.muscle}</div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{ex.target}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {done.length}/{todayWork.exercises.length} complete
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Rest / recovery day. Eat, sleep, stretch. Mobility and a walk are allowed.</p>
        )}
      </div>

      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-6 shadow-xl shadow-primary/5">
        <div className="flex gap-2 mb-5 flex-wrap">
          {PHASES.map((p) => (
            <button key={p.id} onClick={() => setSelectedPhase(p.id)}
              className={cn('px-3 py-2 rounded-xl text-xs font-medium border transition-all',
                selectedPhase === p.id ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-muted/10 border-primary/10 text-muted-foreground hover:text-foreground')}>
              Phase {p.id} — {p.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <CalendarDays className="w-3.5 h-3.5" />
          {format(new Date(activePhase.start), 'MMM d, yyyy')} → {format(new Date(activePhase.end), 'MMM d, yyyy')}
        </div>
        <p className="text-sm text-foreground mb-5">{activePhase.objective}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {[
            { icon: Utensils, title: 'Nutrition', body: activePhase.nutrition },
            { icon: Swords, title: 'Martial Arts', body: activePhase.martialArts },
            { icon: Target, title: 'Milestone', body: activePhase.milestone },
          ].map(c => (
            <div key={c.title} className="p-3 rounded-xl bg-muted/10 border border-primary/10">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
                <c.icon className="w-3.5 h-3.5" /> {c.title}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activePhase.workouts.map((w) => (
            <div key={w.label} className="p-4 rounded-xl bg-muted/10 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{w.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-accent">{w.focus}</span>
              </div>
              <ul className="space-y-1">
                {w.exercises.map((e) => (
                  <li key={e.name} className="flex justify-between text-xs text-muted-foreground gap-2">
                    <span>{e.name}</span>
                    <span className="text-foreground/70 shrink-0">{e.target}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-destructive/20 p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">Non-Negotiables · {totalWeeks} Weeks</h3>
        <ul className="space-y-2">
          {NON_NEGOTIABLES.map((n) => (
            <li key={n} className="flex gap-2 text-sm text-muted-foreground"><span className="text-primary">▸</span>{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BuildPlanPanel;
