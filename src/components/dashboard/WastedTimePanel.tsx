import { useEffect, useState } from 'react';
import { differenceInSeconds, format } from 'date-fns';
import { Skull, AlertTriangle, TrendingDown } from 'lucide-react';

import { useUserConfig } from '@/hooks/useUserConfig';

const HARD_TRUTHS = [
  'You did not fail because you lacked talent. You failed because you did nothing, repeatedly, on purpose.',
  'Every day you skipped, someone your age trained, ate, slept and got closer to the life you keep describing.',
  'The plan was never the problem. The plan existed a year ago. You did.',
  'Motivation already came and went hundreds of times. It is not coming back to save you. Execute anyway.',
  'You cannot buy back a single one of these seconds. You can only stop spending the ones left.',
  'If you quit again, nothing dramatic happens. That is the horror. You just stay exactly like this.',
];

const WastedTimePanel = () => {
  const config = useUserConfig();
  const [now, setNow] = useState(new Date());
  const ABANDONED_ON = config.wastedSince ? new Date(`${config.wastedSince}T00:00:00`) : null;
  const REBUILD_STARTED = new Date(`${config.buildStart}T00:00:00`);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const wastedSeconds = ABANDONED_ON
    ? Math.max(0, differenceInSeconds(REBUILD_STARTED, ABANDONED_ON))
    : 0;
  const wastedDays = Math.floor(wastedSeconds / 86400);
  const wakingHours = Math.round(wastedDays * 16);
  const missedWorkouts = Math.floor((wastedDays / 7) * 4);
  const missedStudyHours = wastedDays * 4;
  const missedMeals = wastedDays * 4;

  const liveSeconds = Math.max(0, differenceInSeconds(now, REBUILD_STARTED));
  const liveDays = Math.floor(liveSeconds / 86400);
  const liveH = Math.floor((liveSeconds % 86400) / 3600);
  const liveM = Math.floor((liveSeconds % 3600) / 60);
  const liveS = liveSeconds % 60;

  const stats = [
    { label: 'Days Burned', value: wastedDays.toLocaleString(), sub: 'gone, permanently' },
    { label: 'Waking Hours Lost', value: wakingHours.toLocaleString(), sub: 'at 16h/day' },
    { label: 'Sessions Skipped', value: missedWorkouts.toLocaleString(), sub: '4 per week, never done' },
    { label: 'Study Hours Lost', value: missedStudyHours.toLocaleString(), sub: '4h/day you owed the exam' },
    { label: 'Surplus Meals Missed', value: missedMeals.toLocaleString(), sub: 'why you are still skinny' },
    { label: 'Excuses Accepted', value: '∞', sub: 'zero of them worked' },
  ];

  return (
    <div className="space-y-6">
      {/* The verdict */}
      <div className="relative overflow-hidden rounded-2xl border border-destructive/40 bg-gradient-to-br from-destructive/10 via-card to-card p-6 md:p-8">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-destructive/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Skull className="w-5 h-5 text-destructive animate-pulse" />
            <span className="text-xs uppercase tracking-[0.3em] text-destructive font-semibold">
              The Cost · Read This Before Every Session
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            You meant to start on{' '}
            <span className="text-destructive">
              {ABANDONED_ON ? format(ABANDONED_ON, 'MMMM d, yyyy') : 'a day you never logged'}
            </span>
            <br className="hidden md:block" /> and then did nothing with it for{' '}
            <span className="text-destructive">{wastedDays} days</span>.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Not a bad year. A deleted year. The dashboard worked. The plan worked. The only broken part
            was the person supposed to open it. That is the whole diagnosis — no mystery, no excuse.
          </p>
        </div>
      </div>

      {/* The receipts */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl bg-card/80 border border-destructive/20 hover:border-destructive/40 transition-colors"
          >
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="text-2xl md:text-3xl font-bold text-destructive tabular-nums">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Live redemption timer */}
      <div className="rounded-2xl border border-primary/30 bg-card/80 p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-4 h-4 text-primary rotate-180" />
          <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
            Time Reclaimed Since Restart
          </span>
        </div>
        <div className="text-4xl md:text-5xl font-bold tabular-nums bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {liveDays}d {String(liveH).padStart(2, '0')}h {String(liveM).padStart(2, '0')}m{' '}
          {String(liveS).padStart(2, '0')}s
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          This number only grows if you keep showing up. It resets to nothing the moment you disappear again.
        </p>
      </div>

      {/* Hard truths */}
      <div className="rounded-2xl border border-destructive/20 bg-card/80 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">No Comfort Section</h3>
        </div>
        <ul className="space-y-3">
          {HARD_TRUTHS.map((t) => (
            <li key={t} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
              <span className="text-destructive font-bold shrink-0">—</span>
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t border-destructive/20 text-center">
          <p className="text-lg font-bold text-foreground italic">
            "{wastedDays} days gone. Do not make this a two-year story."
          </p>
        </div>
      </div>
    </div>
  );
};

export default WastedTimePanel;
