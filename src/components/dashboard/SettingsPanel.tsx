import { useEffect, useState } from 'react';
import { Save, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { getConfig, saveConfig, resetConfig, UserConfig } from '@/config/userConfig';
import { useUserConfig } from '@/hooks/useUserConfig';

const field =
  'w-full px-4 py-2.5 rounded-xl bg-muted/20 border border-primary/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60';
const label = 'text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 block';

const SettingsPanel = () => {
  const config = useUserConfig();
  const [form, setForm] = useState<UserConfig>(() => getConfig());
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(config), [config]);

  const set = (patch: Partial<UserConfig>) => setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    saveConfig({ ...form, name: form.name.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const wipe = () => {
    if (!window.confirm('Reset configuration? Your tracked progress is kept, but setup runs again.')) return;
    resetConfig();
    window.location.reload();
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Local to this device. Change your name, timeline and exam target at any time.
      </p>

      <div>
        <label className={label} htmlFor="s-name">Name</label>
        <input id="s-name" className={field} value={form.name} onChange={(e) => set({ name: e.target.value })} />
      </div>

      <div>
        <label className={label} htmlFor="s-title">Title</label>
        <input id="s-title" className={field} value={form.title} onChange={(e) => set({ title: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="s-start">Start date</label>
          <input id="s-start" type="date" className={field} value={form.buildStart}
            onChange={(e) => set({ buildStart: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="s-deadline">Deadline</label>
          <input id="s-deadline" type="date" className={field} value={form.buildDeadline}
            onChange={(e) => set({ buildDeadline: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="s-examLabel">Exam / event name</label>
          <input id="s-examLabel" className={field} value={form.examLabel}
            onChange={(e) => set({ examLabel: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="s-examDate">Exam date</label>
          <input id="s-examDate" type="date" className={field} value={form.examDate}
            onChange={(e) => set({ examDate: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="s-birth">Birth date</label>
          <input id="s-birth" type="date" className={field} value={form.birthDate}
            onChange={(e) => set({ birthDate: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="s-wasted">Wasted since</label>
          <input id="s-wasted" type="date" className={field} value={form.wastedSince}
            onChange={(e) => set({ wastedSince: e.target.value })} />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/20 border border-primary/40 text-primary font-medium hover:bg-primary/30 transition-colors"
        >
          <Save className="w-4 h-4" /> {saved ? 'Saved' : 'Save changes'}
        </button>
        <button
          onClick={wipe}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm hover:bg-destructive/20 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Run setup again
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
