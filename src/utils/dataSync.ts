// Offline device-to-device sync: export/import every FVC7 local key as one file.

export const SYNC_VERSION = 1;

export interface SyncBundle {
  app: 'FVC7';
  version: number;
  exportedAt: string;
  device: string;
  data: Record<string, string>;
}

const isOurKey = (k: string) => k.startsWith('rx1_') || k.startsWith('fvc7_');

export const collectData = (): Record<string, string> => {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && isOurKey(k)) out[k] = localStorage.getItem(k) ?? '';
  }
  return out;
};

export const buildBundle = (): SyncBundle => ({
  app: 'FVC7',
  version: SYNC_VERSION,
  exportedAt: new Date().toISOString(),
  device: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'unknown',
  data: collectData(),
});

export const downloadBundle = () => {
  const bundle = buildBundle();
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fvc7-sync-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem('fvc7_last_export', new Date().toISOString());
  return Object.keys(bundle.data).length;
};

const parseBundle = (raw: string): SyncBundle => {
  const parsed = JSON.parse(raw);
  if (parsed?.app !== 'FVC7' || typeof parsed?.data !== 'object') {
    throw new Error('Not an FVC7 sync file');
  }
  return parsed as SyncBundle;
};

/** merge: keep the larger/newer numeric values, otherwise incoming wins. */
export const importBundle = (raw: string, mode: 'merge' | 'replace'): number => {
  const bundle = parseBundle(raw);
  let changed = 0;

  if (mode === 'replace') {
    Object.keys(collectData()).forEach((k) => localStorage.removeItem(k));
  }

  Object.entries(bundle.data).forEach(([k, v]) => {
    const current = localStorage.getItem(k);
    if (mode === 'merge' && current !== null) {
      const a = Number(current);
      const b = Number(v);
      if (!Number.isNaN(a) && !Number.isNaN(b)) {
        if (b > a) {
          localStorage.setItem(k, v);
          changed++;
        }
        return;
      }
      if (current === v) return;
    }
    localStorage.setItem(k, v);
    changed++;
  });

  localStorage.setItem('fvc7_last_import', new Date().toISOString());
  return changed;
};

export const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
