import { format } from 'date-fns';
import { getBuildDeadline, getExamDate, getTotalWeeks, getCurrentPhase, getWeekNumber, dayDiff } from '@/data/buildPlan';
import { getConfig } from '@/config/userConfig';

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export interface AppSnapshot {
  today: string;
  week: number;
  phase: string;
  daysToDeadline: number;
  daysToExam: number | null;
  streak: number;
  tasks: { text?: string; title?: string; completed?: boolean }[];
  training: Record<string, unknown>;
  meditationMinutes: number;
  todayBuildLog: string[];
}

export const getSnapshot = (): AppSnapshot => {
  const now = new Date();
  const dateKey = format(now, 'yyyy-MM-dd');
  const buildLog = safeParse<Record<string, string[]>>(localStorage.getItem('fvc7_build_log'), {});
  const phase = getCurrentPhase(now);
  return {
    today: format(now, 'EEEE, MMMM d, yyyy'),
    week: getWeekNumber(now),
    phase: `${phase.id} — ${phase.name}`,
    daysToDeadline: Math.max(0, dayDiff(now, new Date(getBuildDeadline()))),
    daysToExam: getExamDate() ? Math.max(0, dayDiff(now, new Date(getExamDate()))) : null,
    streak: parseInt(localStorage.getItem('rx1_streak') || '0', 10),
    tasks: safeParse(localStorage.getItem('rx1_tasks'), []),
    training: safeParse(localStorage.getItem('rx1_training_v2'), {}),
    meditationMinutes: parseInt(localStorage.getItem('rx1_meditation') || '0', 10),
    todayBuildLog: buildLog[dateKey] ?? [],
  };
};

export const buildSystemPrompt = () => {
  const s = getSnapshot();
  const c = getConfig();
  return `You are FVC7 CORE, a blunt, no-excuses performance coach running fully offline inside ${
    c.name || 'the user'
  }'s training dashboard.
Rules: be direct and short (max 6 sentences unless asked for a plan). No flattery. No emoji. Never invent data.

CURRENT STATE
- Date: ${s.today}
- Build: Week ${s.week}/${getTotalWeeks()}, Phase ${s.phase}
- Days to deadline (${getBuildDeadline()}): ${s.daysToDeadline}
- Days to ${c.examLabel || 'exam'}: ${s.daysToExam ?? 'not tracked'}
- Streak: ${s.streak} days
- Today's completed exercises: ${s.todayBuildLog.length ? s.todayBuildLog.join(', ') : 'none yet'}
- Meditation logged: ${s.meditationMinutes} min
- Open tasks: ${
    s.tasks.length
      ? s.tasks
          .filter((t) => !t.completed)
          .map((t) => t.text || t.title)
          .join('; ') || 'none'
      : 'none'
  }
- Training numbers: ${JSON.stringify(s.training)}

CAPABILITIES
You may change the app. To do so, end your reply with a fenced json block:
\`\`\`json
{"actions":[{"type":"add_task","text":"..."},{"type":"log_meditation","minutes":20},{"type":"complete_exercise","name":"Squats"}]}
\`\`\`
Only include actions the user actually asked for.`;
};

export interface AIAction {
  type: 'add_task' | 'log_meditation' | 'complete_exercise';
  text?: string;
  minutes?: number;
  name?: string;
}

export const extractActions = (reply: string): AIAction[] => {
  const match = reply.match(/```json\s*([\s\S]*?)```/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]);
    return Array.isArray(parsed?.actions) ? parsed.actions : [];
  } catch {
    return [];
  }
};

export const stripActionBlock = (reply: string) => reply.replace(/```json[\s\S]*?```/g, '').trim();

export const applyActions = (actions: AIAction[]): string[] => {
  const applied: string[] = [];
  const dateKey = format(new Date(), 'yyyy-MM-dd');

  actions.forEach((a) => {
    if (a.type === 'add_task' && a.text) {
      const tasks = safeParse<Record<string, unknown>[]>(localStorage.getItem('rx1_tasks'), []);
      tasks.push({ id: Date.now() + Math.random(), text: a.text, completed: false, priority: 'medium' });
      localStorage.setItem('rx1_tasks', JSON.stringify(tasks));
      applied.push(`Task added: ${a.text}`);
    }
    if (a.type === 'log_meditation' && typeof a.minutes === 'number') {
      localStorage.setItem('rx1_meditation', String(a.minutes));
      applied.push(`Meditation set to ${a.minutes} min`);
    }
    if (a.type === 'complete_exercise' && a.name) {
      const log = safeParse<Record<string, string[]>>(localStorage.getItem('fvc7_build_log'), {});
      const day = log[dateKey] ?? [];
      if (!day.includes(a.name)) day.push(a.name);
      log[dateKey] = day;
      localStorage.setItem('fvc7_build_log', JSON.stringify(log));
      applied.push(`Marked done: ${a.name}`);
    }
  });

  return applied;
};
