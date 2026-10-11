import { useState } from 'react';
import { Rocket, ArrowRight, ArrowLeft, Dumbbell, BookOpen, Target, Moon, Briefcase, Scale, Calculator } from 'lucide-react';
import { defaultConfig, saveConfig, UserConfig, FitnessLevel, PrimaryGoal, DEFAULT_SUBJECTS } from '@/config/userConfig';

interface Props {
  onComplete: () => void;
}

const field = 'w-full px-4 py-2.5 rounded-xl bg-muted/20 border border-primary/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60';
const label = 'text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block';
const chip = (on: boolean) =>
  `px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${on ? 'bg-primary/25 border-primary/50 text-primary' : 'bg-muted/10 border-primary/10 text-muted-foreground hover:text-foreground hover:border-primary/30'}`;

const STEPS = ['Profile', 'Goal', 'Schedule', 'Body & Stats'] as const;

const FITNESS: { v: FitnessLevel; label: string; hint: string }[] = [
  { v: 'beginner', label: 'Beginner', hint: '0–6 months training or restarting' },
  { v: 'intermediate', label: 'Intermediate', hint: '6–18 months, consistent' },
  { v: 'advanced', label: 'Advanced', hint: '18+ months, solid baseline' },
];
const GOALS: { v: PrimaryGoal; label: string; icon: any; hint: string }[] = [
  { v: 'exam', label: 'Exam / Study First', icon: BookOpen, hint: 'Body supports the books' },
  { v: 'strength', label: 'Strength', icon: Dumbbell, hint: 'Get strong, move heavy' },
  { v: 'aesthetics', label: 'Aesthetics', icon: Target, hint: 'Look athletic & lean' },
  { v: 'martial', label: 'Martial Arts', icon: Dumbbell, hint: 'Fight skill + conditioning' },
  { v: 'mixed', label: 'Balanced Mix', icon: Calculator, hint: 'Everything, evenly' },
];
const SUBJECT_POOL = ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'Computer Science', 'Economics', 'History', 'English', 'Law', 'Engineering', 'Medicine'];

const OnboardingScreen = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<UserConfig>(() => defaultConfig());
  const set = (patch: Partial<UserConfig>) => setForm(f => ({ ...f, ...patch }));

  const toggleSubject = (s: string) => {
    const cur = form.studySubjects?.slice() || [];
    const next = cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s];
    set({ studySubjects: next.length ? next : [s] });
  };

  const invalid =
    !form.name.trim() ||
    new Date(form.buildDeadline) <= new Date(form.buildStart) ||
    form.studySubjects.length === 0 ||
    !form.sleep.wake || !form.sleep.bed;

  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep(s => Math.max(0, s - 1));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    saveConfig({ ...form, name: form.name.trim(), onboarded: true });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_60%)]" />
      <form onSubmit={step === STEPS.length - 1 ? submit : (e) => { e.preventDefault(); next(); }} className="relative z-10 w-full max-w-2xl rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl p-6 md:p-8 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rocket className="w-5 h-5 text-primary" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Setup · Step {step + 1}/{STEPS.length} — {STEPS[step]}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {step === 0 && 'Who are you?'}
            {step === 1 && 'Your #1 priority this arc'}
            {step === 2 && 'Anchor your daily schedule'}
            {step === 3 && 'Fine-tune & launch'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Everything stays on this device. Plan auto-adjusts to your inputs.
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-accent transition-all"
               style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        {/* Step 0: Profile */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className={label} htmlFor="name">Your name</label>
              <input id="name" className={field} value={form.name}
                onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Alex" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="start">Arc start</label>
                <input id="start" type="date" className={field} value={form.buildStart}
                  onChange={(e) => set({ buildStart: e.target.value })} />
              </div>
              <div>
                <label className={label} htmlFor="deadline">Arc deadline</label>
                <input id="deadline" type="date" className={field} value={form.buildDeadline}
                  onChange={(e) => set({ buildDeadline: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="birth">Birth date (optional)</label>
                <input id="birth" type="date" className={field} value={form.birthDate}
                  onChange={(e) => set({ birthDate: e.target.value })} />
              </div>
              <div>
                <label className={label} htmlFor="wasted">Wasted since (optional)</label>
                <input id="wasted" type="date" className={field} value={form.wastedSince}
                  onChange={(e) => set({ wastedSince: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={label}>Fitness level</label>
              <div className="grid grid-cols-3 gap-2">
                {FITNESS.map(f => (
                  <button type="button" key={f.v} onClick={() => set({ fitnessLevel: f.v })}
                    className={chip(form.fitnessLevel === f.v)}>
                    <div className="font-semibold">{f.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{f.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className={label}>Primary goal this arc</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {GOALS.map(g => (
                  <button type="button" key={g.v} onClick={() => set({ primaryGoal: g.v })}
                    className={`${chip(form.primaryGoal === g.v)} flex flex-col items-center text-center py-3`}>
                    <g.icon className="w-5 h-5 mb-1" />
                    <div className="text-[11px]">{g.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={label}>
                Study subjects <span className="text-muted-foreground normal-case">(pick what applies)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_POOL.map(s => (
                  <button type="button" key={s} onClick={() => toggleSubject(s)}
                    className={chip(form.studySubjects.includes(s))}>{s}</button>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  className={field}
                  placeholder="Add custom subject then press +"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const v = (e.target as HTMLInputElement).value.trim();
                      if (v) { toggleSubject(v); (e.target as HTMLInputElement).value = ''; }
                    }
                  }}
                  id="customSubj"
                />
                <button type="button" className="px-4 rounded-xl bg-primary/20 border border-primary/30 text-primary text-xs"
                  onClick={() => {
                    const el = document.getElementById('customSubj') as HTMLInputElement;
                    if (el?.value.trim()) { toggleSubject(el.value.trim()); el.value = ''; }
                  }}>+</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="studyH">Daily study hours target</label>
                <input id="studyH" type="number" min={0} max={16} step={0.5} className={field} value={form.dailyStudyHours}
                  onChange={(e) => set({ dailyStudyHours: Number(e.target.value) })} />
              </div>
              <div>
                <label className={label}>Martial arts</label>
                <select className={field} value={form.martialInterest}
                  onChange={(e) => set({ martialInterest: e.target.value as any })}>
                  <option value="none">None / not interested</option>
                  <option value="begin">I want to start</option>
                  <option value="continue">I already train</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="exL">Exam / event label (optional)</label>
                <input id="exL" className={field} value={form.examLabel}
                  onChange={(e) => set({ examLabel: e.target.value })} placeholder="Final Exam" />
              </div>
              <div>
                <label className={label} htmlFor="exD">Exam / event date (optional)</label>
                <input id="exD" type="date" className={field} value={form.examDate}
                  onChange={(e) => set({ examDate: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Schedule anchors */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}><Moon className="w-3.5 h-3.5 inline mr-1" /> Wake-up time</label>
                <input type="time" className={field} value={form.sleep.wake}
                  onChange={(e) => set({ sleep: { ...form.sleep, wake: e.target.value } })} />
              </div>
              <div>
                <label className={label}><Moon className="w-3.5 h-3.5 inline mr-1" /> Bedtime</label>
                <input type="time" className={field} value={form.sleep.bed}
                  onChange={(e) => set({ sleep: { ...form.sleep, bed: e.target.value } })} />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
                <input type="checkbox" checked={form.workOrSchool}
                  onChange={(e) => set({ workOrSchool: e.target.checked, obligation: { ...form.obligation, enabled: e.target.checked } })}
                  className="w-4 h-4" />
                <Briefcase className="w-4 h-4" />
                I have work / school Mon–Fri that anchors my day
              </label>
            </div>
            {form.workOrSchool && (
              <div className="grid grid-cols-2 gap-4 pl-6 border-l border-primary/20">
                <div>
                  <label className={label}>Work / school starts</label>
                  <input type="time" className={field} value={form.obligation.start}
                    onChange={(e) => set({ obligation: { ...form.obligation, start: e.target.value, enabled: true } })} />
                </div>
                <div>
                  <label className={label}>Work / school ends</label>
                  <input type="time" className={field} value={form.obligation.end}
                    onChange={(e) => set({ obligation: { ...form.obligation, end: e.target.value, enabled: true } })} />
                </div>
              </div>
            )}
            <div>
              <label className={label} htmlFor="avail">
                Realistic free hours / day I will commit <span className="text-muted-foreground normal-case">(after obligations)</span>
              </label>
              <input id="avail" type="range" min={1} max={12} step={0.5} className="w-full accent-[hsl(var(--primary))]"
                value={form.dailyAvailableHours}
                onChange={(e) => set({ dailyAvailableHours: Number(e.target.value) })} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1h</span><span className="text-sm text-primary font-semibold">{form.dailyAvailableHours}h / day</span><span>12h</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/10 border border-primary/10 rounded-xl p-3">
              🧭 The plan will be built around your sleep window. Obligations become hard blocks.
              Remaining time splits between study, training, recovery and review proportional to your goal and availability.
            </div>
          </div>
        )}

        {/* Step 3: Body stats + confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}><Scale className="w-3.5 h-3.5 inline mr-1" /> Weight (kg, optional)</label>
                <input type="number" min={20} max={300} step={0.1} className={field} placeholder="e.g. 54"
                  value={form.startingWeightKg ?? ''}
                  onChange={(e) => set({ startingWeightKg: e.target.value === '' ? null : Number(e.target.value) })} />
              </div>
              <div>
                <label className={label}><Calculator className="w-3.5 h-3.5 inline mr-1" /> Height (cm, optional)</label>
                <input type="number" min={100} max={250} step={1} className={field} placeholder="e.g. 168"
                  value={form.heightCm ?? ''}
                  onChange={(e) => set({ heightCm: e.target.value === '' ? null : Number(e.target.value) })} />
              </div>
            </div>
            <div className="rounded-xl bg-muted/10 border border-primary/10 p-4 space-y-2 text-sm">
              <div className="font-semibold text-primary">Your arc — summary</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div>Name: <span className="text-foreground">{form.name || '—'}</span></div>
                <div>Level: <span className="text-foreground">{form.fitnessLevel}</span></div>
                <div>Start: <span className="text-foreground">{form.buildStart}</span></div>
                <div>Deadline: <span className="text-foreground">{form.buildDeadline}</span></div>
                <div>Goal: <span className="text-foreground">{form.primaryGoal}</span></div>
                <div>Sleep: <span className="text-foreground">{form.sleep.wake} → {form.sleep.bed}</span></div>
                <div className="col-span-2">Subjects: <span className="text-foreground">{(form.studySubjects.length ? form.studySubjects : DEFAULT_SUBJECTS).join(' · ')}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <button type="button" onClick={prev} disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-muted/10 border border-primary/10 text-sm disabled:opacity-30 hover:bg-muted/20 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="submit" onClick={(e) => { (e.target as HTMLButtonElement).form?.requestSubmit?.(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/20 border border-primary/40 text-primary font-semibold hover:bg-primary/30 transition-colors text-sm">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={invalid}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/25 border border-primary/50 text-primary font-semibold hover:bg-primary/35 disabled:opacity-40 transition-colors text-sm">
              🚀 Start the protocol <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OnboardingScreen;
