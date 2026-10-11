import { format, eachDayOfInterval, subDays, parseISO } from 'date-fns';
import { defaultWeek } from '@/data/arcExercises';
import { getConfig } from '@/config/userConfig';

export interface ArcHabit { id: string; name: string; target: string; created: string; archived?: string; }
export interface ArcLog { habits: string[]; training: number; weight?: number; exercises: string[]; }
export interface ArcState { version: 1; name: string; start: string; end: string; habits: ArcHabit[]; logs: Record<string, ArcLog>; week: typeof defaultWeek; }
export const ARC_KEY = 'fvc7_arc_v1';
export const dateKey = (date = new Date()) => format(date, 'yyyy-MM-dd');
export const emptyLog = (): ArcLog => ({ habits: [], training: 0, exercises: [] });
export function initialArc(): ArcState {
  const c = getConfig();
  return { version: 1, name: 'My Arc', start: c.buildStart, end: c.buildDeadline, week: structuredClone(defaultWeek), logs: {}, habits: [
    { id: 'move', name: 'Train', target: '30 minutes', created: dateKey() },
    { id: 'study', name: 'Deep work', target: '60 minutes', created: dateKey() },
    { id: 'recover', name: 'Recover', target: '8 hours of sleep', created: dateKey() },
  ] };
}
export function loadArc(): ArcState {
  try { const raw = localStorage.getItem(ARC_KEY); if (raw) { const s = JSON.parse(raw); if (s.version === 1 && Array.isArray(s.habits) && Array.isArray(s.week) && s.logs && typeof s.logs === 'object') return s; } } catch { /* Keep corrupt imports from breaking the app. */ }
  return initialArc();
}
export function eligibleHabits(state: ArcState, day: string) { return state.habits.filter(h => h.created <= day && (!h.archived || day < h.archived)); }
export function completion(state: ArcState, day: string) {
  const habits = eligibleHabits(state, day);
  const done = habits.filter(h => state.logs[day]?.habits.includes(h.id)).length;
  return { total: habits.length, done, rate: habits.length ? Math.round(done / habits.length * 100) : 0 };
}
export function trend(state: ArcState, days = 14) {
  return eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() }).map(d => {
    const key = dateKey(d); const log = state.logs[key];
    return { date: key, label: format(d, 'MMM d'), completion: log ? completion(state, key).rate : null, training: log?.training ?? null, weight: log?.weight ?? null };
  });
}
export function habitStreak(state: ArcState, id: string) {
  let days = 0; const today = dateKey();
  let d = state.logs[today]?.habits.includes(id) ? new Date() : subDays(new Date(), 1);
  for (let i = 0; i < 10000; i++) { if (!state.logs[dateKey(d)]?.habits.includes(id)) break; days++; d = subDays(d, 1); }
  return days;
}
export function arcDuration(state: ArcState) { const start = parseISO(state.start), end = parseISO(state.end); return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1); }
export function downloadText(text: string, filename: string) { const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'})); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export const launchScript = (name: string) => `FVC7 / ${name} — “THE RECEIPTS”\nInstagram Reel · 28 seconds · 9:16 vertical\n\n00–03 | Locked close-up: a blank habit grid. Finger hovers, then checks one square.\nVoice: “A new season won't do the work.”\nCaption: NO SEASON WILL SAVE YOU.\n\n03–07 | Cut to ARC settings. Type your arc name, choose your own dates.\nVoice: “Name your own arc. Set your own deadline.”\nCaption: YOUR ARC. YOUR DEADLINE.\n\n07–12 | Screen recording: exercise animation plays; select a session and log real minutes.\nVoice: “Train. Record it. No imaginary progress.”\nCaption: WORK → RECORD.\n\n12–18 | Check a habit; show the actual graph updating. Use your real history, even if small.\nVoice: “One square today. Another tomorrow. The graph keeps the receipts.”\nCaption: THE RECEIPTS DON'T LIE.\n\n18–23 | Export the real Excel workbook. Brief close-up of its chart.\nVoice: “Your data stays yours. Take it with you.”\nCaption: YOUR DATA. YOURS.\n\n23–28 | Static app title over the live ARC screen.\nVoice: “FVC7. Not a transformation promise. A record of the work.”\nCaption: FVC7 / ${name}\n\nAudio: original dry click percussion at 90 BPM, one soft impact per check-off. Clear close voice. No unlicensed music.\nUse actual app footage. No fabricated streaks, before/after bodies, or guaranteed results.\nPost caption: “Call it a winter arc. Call it day one. Just keep the receipts. FVC7 — local-first habits, training, and real progress.”\n`;