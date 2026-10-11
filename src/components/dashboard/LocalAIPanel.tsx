import { useEffect, useRef, useState, useCallback } from 'react';
import { Cpu, Send, Download, Zap, AlertTriangle } from 'lucide-react';
import { buildSystemPrompt, extractActions, applyActions, stripActionBlock } from '@/utils/aiContext';
import { cn } from '@/lib/utils';

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

// Tiniest viable model only — fastest download, runs on modest hardware.
const MODEL = { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 0.5B (tiny)', size: '~350 MB' };

const LocalAIPanel = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const engineRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const loadModel = useCallback(async () => {
    if (engineRef.current) return;
    setStatus('loading');
    setProgress('Initialising WebGPU runtime...');
    try {
      const webllm = await import('@mlc-ai/web-llm');
      engineRef.current = await webllm.CreateMLCEngine(MODEL.id, {
        initProgressCallback: (r: { text: string }) => setProgress(r.text),
      });
      setStatus('ready');
      setProgress('Model resident in memory. Fully offline.');
      localStorage.setItem('fvc7_core_autoload', '1');
    } catch (e) {
      console.error(e);
      setStatus('error');
      setProgress(e instanceof Error ? e.message : 'Failed to load model');
    }
  }, []);

  // Automated: boot the core as soon as the panel opens.
  useEffect(() => {
    if (hasWebGPU) loadModel();
  }, [hasWebGPU, loadModel]);


  const send = async () => {
    if (!input.trim() || !engineRef.current || thinking) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setThinking(true);

    try {
      const reply = await engineRef.current.chat.completions.create({
        messages: [{ role: 'system', content: buildSystemPrompt() }, ...history],
        temperature: 0.6,
        max_tokens: 512,
      });
      const raw: string = reply.choices[0]?.message?.content ?? '';
      const applied = applyActions(extractActions(raw));
      if (applied.length) setActionLog((l) => [...applied, ...l].slice(0, 8));
      setMessages([...history, { role: 'assistant', content: stripActionBlock(raw) || raw }]);
    } catch (e) {
      setMessages([
        ...history,
        { role: 'assistant', content: `Inference failed: ${e instanceof Error ? e.message : 'unknown error'}` },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">FVC7 Core — Local AI</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              A quantized model that runs entirely in your browser on WebGPU. No server, no internet after the
              first download. It reads your live dashboard data and can write tasks, log meditation and tick
              off exercises.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                status === 'ready' ? 'bg-green-500 animate-pulse' : status === 'error' ? 'bg-destructive' : 'bg-muted-foreground'
              )}
            />
            <span className="text-xs text-muted-foreground capitalize">{status}</span>
          </div>
        </div>

        {!hasWebGPU && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-xs text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            WebGPU is not available in this browser. Use Chrome or Edge (desktop, or Android with WebGPU
            enabled) to run the local model.
          </div>
        )}

        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <div className="px-3 py-2 rounded-xl text-xs border bg-primary/20 border-primary/40 text-primary">
            <div className="font-medium">{MODEL.label}</div>
            <div className="text-[10px] opacity-70">{MODEL.size} · auto-starts, cached after first load</div>
          </div>
          {status === 'error' && (
            <button
              onClick={loadModel}
              disabled={!hasWebGPU}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/30 disabled:opacity-40 transition-colors"
            >
              <Download className="w-4 h-4" /> Retry
            </button>
          )}
        </div>


        {progress && (
          <p className="mt-3 text-[11px] text-muted-foreground font-mono break-words">{progress}</p>
        )}
      </div>

      {/* Chat */}
      <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl p-6">
        <div ref={scrollRef} className="h-80 overflow-y-auto scrollbar-thin pr-2 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
              <Zap className="w-6 h-6 text-primary/50" />
              <p className="text-sm max-w-sm">
                Ask things like "audit my week", "add a task to revise organic
                chemistry", or "why am I not gaining weight".
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                'max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-wrap',
                m.role === 'user'
                  ? 'ml-auto bg-primary/20 border border-primary/30 text-foreground'
                  : 'bg-muted/15 border border-primary/10 text-muted-foreground'
              )}
            >
              {m.content}
            </div>
          ))}
          {thinking && <div className="text-xs text-primary animate-pulse">Core is thinking...</div>}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            disabled={status !== 'ready'}
            placeholder={status === 'ready' ? 'Talk to your core...' : 'Core is booting...'}
            className="flex-1 px-4 py-2 rounded-xl bg-muted/20 border border-primary/20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={status !== 'ready' || thinking}
            className="px-4 py-2 rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {actionLog.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/20">
            <div className="text-[10px] uppercase tracking-wider text-accent mb-1">Applied Changes</div>
            <ul className="space-y-0.5">
              {actionLog.map((a, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  ▸ {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalAIPanel;
