import { getConfig } from '@/config/userConfig';

export interface Exercise {
  name: string;
  target: string;
}

export interface WorkoutDay {
  day: number; // 0 = Sunday
  label: string;
  focus: string;
  exercises: Exercise[];
}

export interface Phase {
  id: number;
  name: string;
  start: string;
  end: string;
  objective: string;
  nutrition: string;
  martialArts: string;
  milestone: string;
  workouts: WorkoutDay[];
}


const phase1Workouts: WorkoutDay[] = [
  {
    day: 1,
    label: 'Monday',
    focus: 'Push (STR)',
    exercises: [
      { name: 'Push-ups', target: '4 × 8–12' },
      { name: 'Pike Push-ups', target: '3 × 6–10' },
      { name: 'Chair Dips', target: '3 × 10–15' },
      { name: 'Plank', target: '3 × 30–45s' },
    ],
  },
  {
    day: 3,
    label: 'Wednesday',
    focus: 'Pull (STR/AGI)',
    exercises: [
      { name: 'Doorframe Rows', target: '4 × 10–15' },
      { name: 'Superman Hold', target: '3 × 12' },
      { name: 'Doorframe Bar Hang', target: '3 × max' },
      { name: 'Reverse Snow Angels', target: '3 × 15' },
    ],
  },
  {
    day: 5,
    label: 'Friday',
    focus: 'Legs (VIT/AGI)',
    exercises: [
      { name: 'Squats', target: '4 × 15–20' },
      { name: 'Walking Lunges', target: '3 × 12/leg' },
      { name: 'Glute Bridges', target: '3 × 15' },
      { name: 'Wall Sit', target: '3 × 40–60s' },
      { name: 'Calf Raises', target: '3 × 20' },
    ],
  },
  {
    day: 6,
    label: 'Saturday',
    focus: 'Conditioning (END)',
    exercises: [
      { name: 'Shadowboxing', target: '4 × 2min' },
      { name: 'Burpees', target: '4 × 10' },
      { name: 'Mountain Climbers', target: '3 × 30' },
      { name: 'Jump Rope / Jog', target: '5 × 1min' },
    ],
  },
];

const phase2Workouts: WorkoutDay[] = [
  {
    day: 1,
    label: 'Monday',
    focus: 'Push (Loaded)',
    exercises: [
      { name: 'Weighted Push-ups (vest/backpack)', target: '4 × 8–12' },
      { name: 'Archer / Decline Push-ups', target: '3 × 6–10' },
      { name: 'Weighted Chair Dips', target: '3 × 8–12' },
      { name: 'Plank + Weight', target: '3 × 45–60s' },
    ],
  },
  {
    day: 3,
    label: 'Wednesday',
    focus: 'Pull (Slow Tempo)',
    exercises: [
      { name: 'Doorframe Rows (3s eccentric)', target: '4 × 10–12' },
      { name: 'Negative Pull-ups', target: '4 × 5' },
      { name: 'Bar Hang (weighted)', target: '3 × max' },
      { name: 'Reverse Snow Angels', target: '3 × 20' },
    ],
  },
  {
    day: 5,
    label: 'Friday',
    focus: 'Legs (Loaded)',
    exercises: [
      { name: 'Loaded Squats', target: '4 × 12–15' },
      { name: 'Pistol Squat Progression', target: '3 × 5/leg' },
      { name: 'Loaded Lunges', target: '3 × 12/leg' },
      { name: 'Wall Sit (weighted)', target: '3 × 60s' },
      { name: 'Single-leg Calf Raises', target: '3 × 15/leg' },
    ],
  },
  {
    day: 6,
    label: 'Saturday',
    focus: 'Conditioning + Combat',
    exercises: [
      { name: 'Shadowboxing / Bagwork', target: '5–6 × 3min' },
      { name: 'Burpees', target: '5 × 12' },
      { name: 'Mountain Climbers', target: '4 × 40' },
      { name: 'Sprint Intervals', target: '6 × 1min' },
    ],
  },
];

const phase3Workouts: WorkoutDay[] = [
  {
    day: 1,
    label: 'Monday',
    focus: 'Push + Shoulder Finisher',
    exercises: [
      { name: 'Weighted Push-ups', target: '4 × 10–12' },
      { name: 'Pseudo Planche Push-ups', target: '3 × 8' },
      { name: 'Diamond Push-ups', target: '3 × 12' },
      { name: 'Lateral Raises (bottles)', target: '3 × 15' },
    ],
  },
  {
    day: 3,
    label: 'Wednesday',
    focus: 'Pull + Arms',
    exercises: [
      { name: 'Pull-ups / Weighted Rows', target: '4 × 8–10' },
      { name: 'Chin-ups (biceps focus)', target: '3 × 8' },
      { name: 'Hanging Leg Raises', target: '3 × 12' },
      { name: 'Face-pull (towel/band)', target: '3 × 15' },
    ],
  },
  {
    day: 5,
    label: 'Friday',
    focus: 'Legs + Core',
    exercises: [
      { name: 'Loaded Squats', target: '4 × 15' },
      { name: 'Bulgarian Split Squats', target: '3 × 10/leg' },
      { name: 'Nordic Curl Progression', target: '3 × 6' },
      { name: 'Hollow Body Hold', target: '3 × 45s' },
      { name: 'Hanging Knee Raises', target: '3 × 15' },
    ],
  },
  {
    day: 6,
    label: 'Saturday',
    focus: 'Combat Conditioning',
    exercises: [
      { name: 'Rounds (Muay Thai / Boxing / BJJ)', target: '6 × 3min' },
      { name: 'Burpee → Shadowbox Combo', target: '5 × 1min' },
      { name: 'Jump Rope', target: '8 × 1min' },
      { name: 'Core Circuit', target: '3 rounds' },
    ],
  },
];

const PHASE_TEMPLATES: Phase[] = [
  {
    id: 1,
    name: 'Foundation',
    start: '',
    end: '',
    objective:
      'Build the training habit, learn correct movement, start eating in a real caloric surplus. Consistency, not intensity.',
    nutrition:
      'Caloric surplus: rice, dhal, eggs, milk powder, bananas + peanuts, chicken 2–3×/week. ~0.7–1g protein per lb of goal bodyweight. Aim ~0.5kg/week gain — if not gaining, eat more.',
    martialArts: 'Not yet. Shadowboxing + footwork only, so you are not starting from zero later.',
    milestone:
      'End of Phase 1: full-body strength baseline established, weight trending up, all Phase 1 exercises noticeably easier than week 1.',
    workouts: phase1Workouts,
  },
  {
    id: 2,
    name: 'Progression',
    start: '',
    end: '',
    objective:
      'Bodyweight alone gets too easy — add resistance and harder variations. Begin martial arts if a gym becomes accessible.',
    nutrition: 'Same surplus approach. Reassess intake if weight gain has stalled or gone too fast.',
    martialArts: 'Start now if possible — Muay Thai, Boxing, or BJJ. 2×/week, adjust volume so recovery does not suffer.',
    milestone:
      'End of Phase 2: visibly more muscle, using added resistance regularly, martial arts fundamentals underway.',
    workouts: phase2Workouts,
  },
  {
    id: 3,
    name: 'Refinement',
    start: '',
    end: '',
    objective:
      'Sharpen the aesthetic — shoulders, arms, core — while maintaining strength and martial arts progress. Final stretch.',
    nutrition:
      'Final 6–8 weeks: shift toward slight recomposition — keep protein high, trim excess surplus for visible definition by deadline.',
    martialArts: '2–3×/week if accessible. Balance weekly volume to avoid overtraining. Deload every 5th week.',
    milestone:
      'By the deadline: lean-athletic-muscular look achieved, all movements at advanced difficulty, functional martial arts skill.',
    workouts: phase3Workouts,
  },
];

export const NON_NEGOTIABLES = [
  'Never skip meals — being skinny means the failure point is always food, not effort.',
  'Progressive overload every phase — harder reps, added weight, or more rounds.',
  '1 full rest day minimum between training days when possible.',
  'Sleep 6+ hours — this is when the actual muscle building happens.',
];

export const dayDiff = (from: Date, to: Date) =>
  Math.round((to.getTime() - from.getTime()) / 86400000);

// ---- Configurable timeline -------------------------------------------------
// Dates come from the user's own configuration; the phase content below is a
// generic template stretched across whatever span they picked.

export const getBuildStart = () => getConfig().buildStart;
export const getBuildDeadline = () => getConfig().buildDeadline;
export const getExamDate = () => getConfig().examDate;

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const PHASE_FRACTIONS: [number, number][] = [
  [0, 0.35],
  [0.35, 0.7],
  [0.7, 1],
];

export const getTotalWeeks = () => {
  const span = new Date(getBuildDeadline()).getTime() - new Date(getBuildStart()).getTime();
  return Math.max(1, Math.round(span / (7 * 86400000)));
};

export const getPhases = (): Phase[] => {
  const start = new Date(getBuildStart()).getTime();
  const span = Math.max(86400000, new Date(getBuildDeadline()).getTime() - start);
  return PHASE_TEMPLATES.map((p, i) => {
    const [a, b] = PHASE_FRACTIONS[i] ?? [0, 1];
    const isLast = i === PHASE_FRACTIONS.length - 1;
    return {
      ...p,
      start: isoDay(start + span * a),
      end: isoDay(start + span * b - (isLast ? 0 : 86400000)),
    };
  });
};

export const getCurrentPhase = (now = new Date()): Phase => {
  const phases = getPhases();
  const t = now.getTime();
  return (
    phases.find(
      (p) => t >= new Date(p.start).getTime() && t <= new Date(p.end + 'T23:59:59').getTime()
    ) ?? (t < new Date(getBuildStart()).getTime() ? phases[0] : phases[phases.length - 1])
  );
};

export const getWeekNumber = (now = new Date()) =>
  Math.max(
    1,
    Math.min(getTotalWeeks(), Math.floor(dayDiff(new Date(getBuildStart()), now) / 7) + 1)
  );

export const isDeload = (now = new Date()) => {
  const phase = getCurrentPhase(now);
  if (phase.id !== 3) return false;
  const w = Math.floor(dayDiff(new Date(phase.start), now) / 7) + 1;
  return w % 5 === 0;
};
