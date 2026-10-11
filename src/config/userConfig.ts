// Per-device configuration. Nothing personal is hardcoded in the app —
// every user configures their own name, dates and goals on first launch.
// Plan auto-adjustment reads these fields to tailor time blocks, exercise
// volume and study focus to the person actually using the app.

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type PrimaryGoal = 'exam' | 'strength' | 'aesthetics' | 'martial' | 'mixed';
export type DaySchedule = { start: string; end: string; enabled: boolean }; // "HH:MM" 24h

export interface UserConfig {
  name: string;
  birthDate: string; // yyyy-MM-dd, optional (empty = hidden)
  title: string;
  buildStart: string; // yyyy-MM-dd
  buildDeadline: string; // yyyy-MM-dd
  examDate: string; // yyyy-MM-dd, optional (empty = no exam tracking)
  examLabel: string;
  wastedSince: string; // yyyy-MM-dd, optional origin for "The Cost"
  onboarded: boolean;

  // --- Auto-adjust inputs (set at onboarding, editable later) ---------
  fitnessLevel: FitnessLevel;
  trainingExperienceMonths: number; // 0 = brand new
  primaryGoal: PrimaryGoal;

  // Study / exam focus
  studySubjects: string[]; // e.g. ["Biology","Chemistry","Physics"]
  dailyStudyHours: number; // target study hours per day

  // Obligations that anchor the schedule
  workOrSchool: boolean;
  obligation: DaySchedule; // default hours, applied mon-fri by default

  // Sleep window (frames the entire day)
  sleep: { wake: string; bed: string };

  // How much of the remaining time the person is realistically willing to commit
  dailyAvailableHours: number; // derived but stored override (free time after obligations)

  // Martial arts preference
  martialInterest: 'none' | 'begin' | 'continue';

  // Body / starting stats (optional, used for scaling)
  startingWeightKg: number | null;
  heightCm: number | null;
}

export const CONFIG_KEY = 'fvc7_config';
const CONFIG_EVENT = 'fvc7-config-change';

const iso = (d: Date) => d.toISOString().slice(0, 10);

export const DEFAULT_SUBJECTS = ['Biology', 'Chemistry', 'Physics'];

export const defaultConfig = (): UserConfig => {
  const start = new Date();
  const deadline = new Date(start.getTime() + 50 * 7 * 86400000);
  return {
    name: '',
    birthDate: '',
    title: 'The One Who Levels Up',
    buildStart: iso(start),
    buildDeadline: iso(deadline),
    examDate: '',
    examLabel: 'Exam',
    wastedSince: '',
    onboarded: false,

    fitnessLevel: 'beginner',
    trainingExperienceMonths: 0,
    primaryGoal: 'mixed',

    studySubjects: [...DEFAULT_SUBJECTS],
    dailyStudyHours: 4,

    workOrSchool: true,
    obligation: { start: '08:00', end: '15:00', enabled: true },

    sleep: { wake: '06:30', bed: '23:00' },

    dailyAvailableHours: 4,

    martialInterest: 'none',

    startingWeightKg: null,
    heightCm: null,
  };
};

let cache: UserConfig | null = null;

export const getConfig = (): UserConfig => {
  if (cache) return cache;
  const base = defaultConfig();
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    cache = raw ? { ...base, ...(JSON.parse(raw) as Partial<UserConfig>) } : base;
  } catch {
    cache = base;
  }
  return cache;
};

export const saveConfig = (patch: Partial<UserConfig>): UserConfig => {
  const next = { ...getConfig(), ...patch };
  cache = next;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CONFIG_EVENT));
  return next;
};

export const resetConfig = () => {
  cache = null;
  localStorage.removeItem(CONFIG_KEY);
  window.dispatchEvent(new CustomEvent(CONFIG_EVENT));
};

export const subscribeConfig = (fn: () => void) => {
  window.addEventListener(CONFIG_EVENT, fn);
  return () => window.removeEventListener(CONFIG_EVENT, fn);
};

export const calculateAge = (birthDate: string): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const before =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (before) age -= 1;
  return age;
};
