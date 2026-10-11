import { getConfig, type UserConfig, type FitnessLevel, DEFAULT_SUBJECTS } from '@/config/userConfig';
import { differenceInMinutes, format, addMinutes } from 'date-fns';

export interface PlanBlock {
  start: string; // "HH:MM"
  end: string;
  durationMin: number;
  label: string;
  detail: string;
  strategy: string;
  kind: 'study' | 'train' | 'obligation' | 'rest' | 'sleep' | 'review' | 'warmup';
  icon: 'book' | 'dumbbell' | 'school' | 'coffee' | 'moon' | 'eye' | 'flame';
  color: string;
}

export interface ScaledExercise {
  name: string;
  target: string;
  muscle: string;
}

export interface ScaledDay {
  focus: string;
  exercises: ScaledExercise[];
  cardioMin: number;
}

const HMtoMin = (hm: string) => {
  const [h, m] = hm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const minToHM = (m: number) => {
  const h = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

// ---------- Volume / fitness scaling tables ------------------------------------
const VOLUME: Record<FitnessLevel, { sets: [number, number]; reps: [number, number]; sessions: number }> = {
  beginner: { sets: [3, 4], reps: [8, 12], sessions: 3 },
  intermediate: { sets: [4, 5], reps: [6, 14], sessions: 4 },
  advanced: { sets: [5, 6], reps: [5, 20], sessions: 5 },
};

const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];

const PUSH = [
  { name: 'Push-ups', muscle: 'Chest · Triceps' },
  { name: 'Pike Push-ups', muscle: 'Shoulders · Triceps' },
  { name: 'Chair Dips', muscle: 'Triceps · Chest' },
  { name: 'Diamond Push-ups', muscle: 'Triceps · Chest' },
  { name: 'Decline Push-ups', muscle: 'Upper Chest · Shoulders' },
];
const PULL = [
  { name: 'Doorframe Rows', muscle: 'Lats · Biceps' },
  { name: 'Towel Rows', muscle: 'Mid Back · Biceps' },
  { name: 'Bar Hang', muscle: 'Grip · Lats' },
  { name: 'Superman', muscle: 'Lower Back · Rear Delts' },
  { name: 'Face Pull (towel)', muscle: 'Rear Delts · Upper Back' },
];
const LEGS = [
  { name: 'Squats', muscle: 'Quads · Glutes' },
  { name: 'Bulgarian Split Squats', muscle: 'Quads · Glutes' },
  { name: 'Glute Bridges', muscle: 'Glutes · Hamstrings' },
  { name: 'Lunges', muscle: 'Legs · Balance' },
  { name: 'Calf Raises', muscle: 'Calves' },
  { name: 'Wall Sit', muscle: 'Quads · Endurance' },
];
const CORE = [
  { name: 'Plank', muscle: 'Core · Stability' },
  { name: 'Leg Raises', muscle: 'Lower Abs' },
  { name: 'Hollow Body Hold', muscle: 'Full Core' },
  { name: 'Russian Twists', muscle: 'Obliques' },
];
const CONDITIONING = [
  { name: 'Jog in Place', muscle: 'Cardio' },
  { name: 'Burpees', muscle: 'Full Body · Cardio' },
  { name: 'Mountain Climbers', muscle: 'Core · Cardio' },
  { name: 'Jump Rope (simulated)', muscle: 'Cardio · Footwork' },
];
const MARTIAL = [
  { name: 'Shadowboxing', muscle: 'Combat · Cardio' },
  { name: 'Footwork Drills', muscle: 'Mobility · Balance' },
  { name: 'Kick Form (air)', muscle: 'Technique · Legs' },
];

const fmtTarget = (sets: number, reps: string, isHold = false) =>
  isHold ? `${sets} × ${reps}` : `${sets} × ${reps}`;

export function scaleWorkoutFor(cfg: UserConfig, phaseWeek: number): ScaledDay[] {
  const { fitnessLevel, primaryGoal, martialInterest, trainingExperienceMonths } = cfg;
  const v = VOLUME[fitnessLevel] ?? VOLUME.beginner;
  // Intensity ramps with phase week (0..phaseEnd) — 1.0 → 1.25
  const ramp = 1 + Math.min(0.25, phaseWeek * 0.01);
  const baseSets = Math.round(((v.sets[0] + v.sets[1]) / 2) * ramp);

  const mkDay = (focus: string, pool: typeof PUSH, extra: typeof PUSH = []): ScaledDay => {
    const nPerDay = Math.max(3, Math.min(5, baseSets >= 5 ? 5 : 4));
    const selected: ScaledExercise[] = [];
    for (let i = 0; i < nPerDay; i++) {
      const ex = pick(pool, i);
      const isHold = /Hold|Plank|Wall Sit/i.test(ex.name);
      let reps: string;
      if (isHold) {
        reps = `${Math.round((20 + (v.reps[1] - 6) * 2) * ramp)}s`;
      } else {
        const lo = v.reps[0], hi = v.reps[1];
        reps = fitnessLevel === 'beginner' ? `${Math.round(lo)}-${Math.round(hi * 0.8)}` : `${Math.round(lo)}-${Math.round(hi)}`;
      }
      selected.push({ name: ex.name, muscle: ex.muscle, target: fmtTarget(baseSets, reps, isHold) });
    }
    extra.slice(0, 2).forEach((e, i) => {
      const isHold = /Hold|Plank|Wall Sit/i.test(e.name);
      selected.push({ name: e.name, muscle: e.muscle, target: fmtTarget(Math.max(2, baseSets - 1), isHold ? '30s' : `${v.reps[0]}-${v.reps[1]}`, isHold) });
    });
    let cardioMin = 0;
    if (primaryGoal === 'exam' || fitnessLevel === 'beginner') cardioMin = 20;
    else if (primaryGoal === 'martial' || fitnessLevel === 'advanced') cardioMin = 45;
    else cardioMin = 30;
    return { focus, exercises: selected, cardioMin };
  };

  const weekly: ScaledDay[] = [];
  weekly.push(mkDay('Push (Chest · Shoulders · Triceps)', PUSH, CORE));
  weekly.push(mkDay('Pull (Back · Biceps · Grip)', PULL, CORE));
  weekly.push(mkDay('Legs + Core', LEGS, CORE));
  if (v.sessions >= 4) {
    const cond = martialInterest !== 'none' ? [...MARTIAL, ...CONDITIONING] : CONDITIONING;
    weekly.push(mkDay(martialInterest !== 'none' ? 'Martial Conditioning' : 'Conditioning', cond));
  }
  if (v.sessions >= 5) {
    weekly.push(mkDay('Push + Pull Circuit', [...PUSH, ...PULL], CORE));
  }
  if (trainingExperienceMonths >= 12 || primaryGoal === 'aesthetics') {
    weekly[0] = mkDay('Push (Hypertrophy Focus)', PUSH, CORE);
    weekly[1] = mkDay('Pull (Width + Thickness)', PULL, CORE);
  }
  if (primaryGoal === 'martial' && martialInterest !== 'none') {
    weekly.push({ focus: 'Combat Skill', exercises: MARTIAL.map(e => ({ ...e, target: `${baseSets} × 3min` })), cardioMin: 30 });
  }
  if (primaryGoal === 'strength') {
    weekly.forEach(d => { d.exercises.forEach(e => { if (!/Hold|Plank|Wall Sit|min/i.test(e.target)) { const [sets] = e.target.split(' × '); e.target = `${Number(sets) + 1} × 3-6`; } }); });
  }
  if (primaryGoal === 'exam') {
    weekly.forEach(d => { d.cardioMin = Math.max(15, Math.round(d.cardioMin * 0.7)); });
  }
  return weekly;
}

// ---------- Day schedule auto-construction ------------------------------------
const ROT_COLORS = [
  { icon: 'book' as const, color: 'text-blue-400' },
  { icon: 'eye' as const, color: 'text-purple-400' },
  { icon: 'flame' as const, color: 'text-yellow-400' },
  { icon: 'dumbbell' as const, color: 'text-orange-400' },
  { icon: 'coffee' as const, color: 'text-green-400' },
  { icon: 'school' as const, color: 'text-cyan-400' },
  { icon: 'moon' as const, color: 'text-indigo-400' },
];

export function buildDailySchedule(cfg: UserConfig = getConfig(), weekday = new Date().getDay()): PlanBlock[] {
  const isWeekend = weekday === 0 || weekday === 6;
  const subjs = (cfg.studySubjects?.length ? cfg.studySubjects : DEFAULT_SUBJECTS).slice();
  const wake = HMtoMin(cfg.sleep?.wake || '06:30');
  const bed = HMtoMin(cfg.sleep?.bed || '23:00');

  const blocks: PlanBlock[] = [];
  let cursor = wake;

  // Optional: short morning warmup/stretch
  blocks.push({
    start: minToHM(cursor), end: minToHM(cursor + 10), durationMin: 10,
    label: 'Wake-up · Hydrate', detail: '-', strategy: 'Glass of water, light stretch, 10 deep breaths.',
    kind: 'warmup', icon: 'flame', color: ROT_COLORS[3].color,
  });
  cursor += 10;

  // Obligation (school/work) — mon-fri by default
  const obligEnabled = cfg.obligation?.enabled && !isWeekend;
  const obligStart = obligEnabled ? HMtoMin(cfg.obligation.start) : null;
  const obligEnd = obligEnabled ? HMtoMin(cfg.obligation.end) : null;

  // Morning study / training block BEFORE obligation if possible
  const preOblig = obligStart && obligStart > cursor + 45 ? obligStart - cursor : 0;
  if (preOblig >= 45) {
    const useForTrain = cfg.primaryGoal !== 'exam' && preOblig >= 55;
    const studyMin = useForTrain ? Math.max(20, preOblig - 35) : Math.min(preOblig - 10, 90);
    const tMin = useForTrain ? preOblig - studyMin - 5 : 0;
    if (cfg.primaryGoal !== 'strength' && cfg.primaryGoal !== 'aesthetics' && studyMin > 0) {
      const first = pick(subjs, 0);
      blocks.push({
        start: minToHM(cursor), end: minToHM(cursor + studyMin), durationMin: studyMin,
        label: cfg.examDate ? `High-Yield ${first}` : 'Deep Work Sprint',
        detail: cfg.examDate ? `${first} focus` : 'Hardest task first',
        strategy: cfg.examDate ? `${Math.round(studyMin / 10)} MCQs · past papers 2019-24 · Feynman aloud.` : 'Phone on airplane mode. Pomodoro 25/5.',
        kind: 'study', icon: 'book', color: ROT_COLORS[0].color,
      });
      cursor += studyMin;
    }
    if (tMin >= 25) {
      blocks.push({
        start: minToHM(cursor), end: minToHM(cursor + tMin), durationMin: tMin,
        label: 'Morning Training', detail: 'Endorphin boost', strategy: `${tMin} min · bodyweight session + walk.`,
        kind: 'train', icon: 'dumbbell', color: ROT_COLORS[3].color,
      });
      cursor += tMin;
    }
    if (obligStart && cursor < obligStart - 5) {
      const pMin = obligStart - cursor;
      blocks.push({
        start: minToHM(cursor), end: minToHM(cursor + pMin), durationMin: pMin,
        label: 'Prep & Commute', detail: '-', strategy: `Pack bag, meal prep, leave ${pMin} min buffer.`,
        kind: 'rest', icon: 'coffee', color: ROT_COLORS[4].color,
      });
      cursor = obligStart;
    }
  }

  if (obligEnabled && obligStart !== null && obligEnd !== null && obligEnd > obligStart) {
    blocks.push({
      start: minToHM(obligStart), end: minToHM(obligEnd), durationMin: obligEnd - obligStart,
      label: cfg.workOrSchool ? 'School / Work' : 'Focus Block',
      detail: cfg.workOrSchool ? `${subjs.slice(0, 2).join(' · ')}` : 'Deep work',
      strategy: cfg.workOrSchool ? 'Active listening. Base concepts only. 5-min review after each period.' : 'No context switches — one project per 90-min block.',
      kind: 'obligation', icon: 'school', color: ROT_COLORS[5].color,
    });
    cursor = obligEnd;
  }

  // Lunch / recovery
  const lunchMin = 40;
  blocks.push({
    start: minToHM(cursor), end: minToHM(cursor + lunchMin), durationMin: lunchMin,
    label: 'Lunch · Recovery', detail: '-', strategy: 'Real meal. No phone. 10-min walk outside if possible.',
    kind: 'rest', icon: 'coffee', color: ROT_COLORS[4].color,
  });
  cursor += lunchMin;

  // Remaining awake hours — split between study/training/review proportional to goal + free time
  const remaining = Math.max(0, bed - cursor - 90); // 90 reserved for evening winddown
  const studyBudget = Math.round(remaining * (cfg.primaryGoal === 'exam' ? 0.65 : cfg.primaryGoal === 'strength' || cfg.primaryGoal === 'aesthetics' ? 0.3 : 0.5));
  const trainBudget = Math.round(remaining * (cfg.primaryGoal === 'exam' ? 0.12 : cfg.primaryGoal === 'martial' ? 0.3 : cfg.primaryGoal === 'strength' || cfg.primaryGoal === 'aesthetics' ? 0.28 : 0.18));
  const reviewBudget = Math.round(remaining * (cfg.primaryGoal === 'exam' ? 0.15 : 0.1));
  const breakBudget = Math.max(30, remaining - studyBudget - trainBudget - reviewBudget);

  const studyHourTarget = Math.max(1, cfg.dailyStudyHours || 4) * 60;
  const effectiveStudy = Math.max(60, Math.min(remaining * 0.75, studyHourTarget));
  const studyChunks = chunkTime(effectiveStudy, 60, 90);
  let subjIdx = 0;
  studyChunks.forEach((mins, i) => {
    const subject = pick(subjs, subjIdx++);
    blocks.push({
      start: minToHM(cursor), end: minToHM(cursor + mins), durationMin: mins,
      label: i === 0 ? 'Theory Sprint' : cfg.primaryGoal === 'exam' ? 'Structured Practice' : 'Deep Work Block',
      detail: subjs.length > 1 ? `${mins} min · ${subject}` : `${mins} min`,
      strategy: cfg.examDate
        ? `${i === 0 ? 'NIE PDF → Feynman explain aloud.' : '1 full Q/subject · Mark-scheme analysis.'} Pomodoro 50/10.`
        : `Chunked focus. Capture TODOs, no open loops. 5-min recap at end.`,
      kind: 'study', icon: 'book', color: pick(ROT_COLORS, i).color,
    });
    cursor += mins;
    // 10-min break between chunks
    if (i < studyChunks.length - 1) {
      blocks.push({
        start: minToHM(cursor), end: minToHM(cursor + 10), durationMin: 10,
        label: 'Short Break', detail: '-', strategy: 'Stand up. Walk. Water. No scroll.',
        kind: 'rest', icon: 'coffee', color: ROT_COLORS[4].color,
      });
      cursor += 10;
    }
  });

  // Training block AFTERNOON
  if (trainBudget >= 30) {
    blocks.push({
      start: minToHM(cursor), end: minToHM(cursor + trainBudget), durationMin: trainBudget,
      label: 'Training Session', detail: `${trainBudget} min`, strategy: 'Warm up 5min. Main session. Cool down stretch. Log minutes to ARC.',
      kind: 'train', icon: 'dumbbell', color: ROT_COLORS[3].color,
    });
    cursor += trainBudget;
  }

  // Meditation / reset
  blocks.push({
    start: minToHM(cursor), end: minToHM(cursor + 15), durationMin: 15,
    label: 'Meditation · Reset', detail: '-', strategy: '15 min box breathing 4-4-4-4. Eyes closed, no timer on the desk.',
    kind: 'rest', icon: 'coffee', color: ROT_COLORS[4].color,
  });
  cursor += 15;

  // Evening review / flashcards
  if (reviewBudget >= 30) {
    blocks.push({
      start: minToHM(cursor), end: minToHM(cursor + reviewBudget), durationMin: reviewBudget,
      label: cfg.examDate ? 'Error Review · Flashcards' : 'Day Review',
      detail: cfg.examDate ? `${subjs.join(' · ')}` : 'Planning + journal',
      strategy: cfg.examDate ? 'Active recall. Re-do 3 mistakes from today. Anki 15 min.' : '3 wins, 1 fix, tomorrow plan on paper.',
      kind: 'review', icon: 'eye', color: ROT_COLORS[1].color,
    });
    cursor += reviewBudget;
  }

  // Dinner + stretch
  const dinnerMin = Math.max(30, Math.min(60, breakBudget - 15));
  blocks.push({
    start: minToHM(cursor), end: minToHM(cursor + dinnerMin), durationMin: dinnerMin,
    label: 'Dinner · Stretch', detail: '-', strategy: `Eat slow. 10-min full-body stretch. Screen-free if possible.`,
    kind: 'rest', icon: 'coffee', color: ROT_COLORS[4].color,
  });
  cursor += dinnerMin;

  // Wind-down + sleep block
  blocks.push({
    start: minToHM(cursor), end: minToHM(bed), durationMin: bed - cursor,
    label: 'Wind-down', detail: '-', strategy: 'No bright screens. Read, journal, plan tomorrow. Dim lights.',
    kind: 'sleep', icon: 'moon', color: ROT_COLORS[6].color,
  });

  // Sanity: trim / dedupe overlaps and sort by start
  return blocks
    .filter(b => b.durationMin > 1)
    .sort((a, b) => HMtoMin(a.start) - HMtoMin(b.start));
}

function chunkTime(total: number, minChunk: number, maxChunk: number): number[] {
  const out: number[] = [];
  let rem = total;
  while (rem > 0) {
    const next = Math.min(maxChunk, Math.max(minChunk, rem));
    out.push(next);
    rem -= next;
    if (rem < minChunk * 0.6 && out.length) { out[out.length - 1] += rem; rem = 0; }
  }
  return out;
}

// ---------- Daily target summary (for download/plan text) --------------------
export function dailyTargets(cfg: UserConfig = getConfig()) {
  const plan = buildDailySchedule(cfg);
  const studyMin = plan.filter(p => p.kind === 'study').reduce((a, b) => a + b.durationMin, 0);
  const trainMin = plan.filter(p => p.kind === 'train').reduce((a, b) => a + b.durationMin, 0);
  return {
    studyMin, trainMin,
    lines: [
      ...(cfg.examDate ? [`${Math.max(30, Math.round(studyMin / 12))} MCQs (high-yield past papers)`] : []),
      `${Math.round(trainMin)} min Training (log to ARC)`,
      `${Math.round(studyMin / 60 * 10) / 10}h Focus / Deep work`,
      '15 min Meditation / box breathing',
      ...(cfg.examDate ? ['Error Review + Flashcards (15 min minimum)'] : ['End-of-day review + plan tomorrow']),
      '8h sleep window — no phone in bed',
    ],
  };
}

export function todayWorkout(cfg: UserConfig = getConfig(), weekday = new Date().getDay()): ScaledDay | null {
  const days = scaleWorkoutFor(cfg, 1);
  // Map mon=1, wed=3, fri=5, sat=6 to workout days; sun/tue/thu = rest or optional
  const map: Record<number, number> = { 1: 0, 3: 1, 5: 2, 6: 3 };
  const idx = map[weekday];
  if (idx === undefined || idx >= days.length) return null;
  return days[idx];
}

export function weeklyRotation(cfg: UserConfig = getConfig()): string[] {
  const subs = cfg.studySubjects?.length ? cfg.studySubjects : DEFAULT_SUBJECTS;
  return subs;
}
