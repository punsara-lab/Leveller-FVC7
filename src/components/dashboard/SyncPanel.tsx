import { useRef, useState } from 'react';
import { RefreshCw, Download, Upload, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { downloadBundle, importBundle, readFile, collectData } from '@/utils/dataSync';
import { cn } from '@/lib/utils';

const SyncPanel = () => {
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const fileRef = useRef<HTMLInputElement>(null);

  const lastExport = localStorage.getItem('fvc7_last_export');
  const lastImport = localStorage.getItem('fvc7_last_import');
  const keyCount = Object.keys(collectData()).length;

  const onExport = () => {
    const n = downloadBundle();
    setStatus(`Exported ${n} data blocks. Move the file to your other device and import it there.`);
  };

  const onFile = async (file?: File | null) => {
    if (!file) return;
    try {
      const n = importBundle(await readFile(file), mode);
      setStatus(`Imported. ${n} values updated. Reloading...`);
      setTimeout(() => window.location.reload(), 900);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Import failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl p-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Device Sync</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Everything lives on the device, offline. To move progress between phone and PC, export a
          single sync file here and import it on the other device. No server, no account.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="p-3 rounded-xl bg-muted/15 border border-primary/10">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Data blocks</div>
            <div className="text-lg font-bold text-foreground">{keyCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/15 border border-primary/10">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last export</div>
            <div className="text-sm text-foreground">{lastExport ? new Date(lastExport).toLocaleString() : 'never'}</div>
          </div>
          <div className="p-3 rounded-xl bg-muted/15 border border-primary/10">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last import</div>
            <div className="text-sm text-foreground">{lastImport ? new Date(lastImport).toLocaleString() : 'never'}</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(['merge', 'replace'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs border transition-all',
                mode === m
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'bg-muted/10 border-primary/10 text-muted-foreground hover:text-foreground'
              )}
            >
              {m === 'merge' ? 'Merge (keep highest progress)' : 'Replace (overwrite this device)'}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
          >
            <Download className="w-4 h-4" /> Export sync file
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/30 transition-colors"
          >
            <Upload className="w-4 h-4" /> Import sync file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>

        {status && <p className="mt-3 text-xs text-muted-foreground font-mono break-words">{status}</p>}
      </div>

      <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">How to run it</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <Monitor className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            Train on PC all day, hit Export before you close it.
          </li>
          <li className="flex gap-2">
            <Smartphone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            Open FVC7 on the phone, Import the file, choose Merge. Highest numbers survive.
          </li>
          <li className="flex gap-2">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            The file is plain JSON you own. Nothing leaves your devices.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default SyncPanel;
