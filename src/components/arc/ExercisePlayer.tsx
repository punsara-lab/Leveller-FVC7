import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exercises, prescriptions } from '@/data/arcExercises';

export default function ExercisePlayer({selected, onSelect}: {selected:number; onSelect:(n:number)=>void}) {
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [time, setTime] = useState(0);
  const [filter, setFilter] = useState('All');
  const e = exercises[selected] ?? exercises[0];
  useEffect(() => { setTime(0); }, [selected]);
  useEffect(() => { if (!playing) return; let frame = 0, last = 0; const tick = (now:number) => { if (last) setTime(t => t + Math.min((now-last)/1000, .1)); last=now; frame=requestAnimationFrame(tick); }; frame=requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [playing]);
  const cardio = e.g === 'Cardio';
  const duration = cardio ? .9 : 6;
  const ph = (1-Math.cos(2*Math.PI*time/duration))/2;
  const points = e.A.reduce<number[][]>((a, n, i) => { if (i%2===0) a.push([n+(e.B[i]-n)*ph,e.A[i+1]+(e.B[i+1]-e.A[i+1])*ph]); return a; }, []);
  const segments: [number,number,string,number][] = [[4,5,'l',11],[5,6,'l',8],[1,4,'t',16],[1,2,'a',9],[2,3,'a',7],[1,0,'n',6], ...(points.length>7 ? [[4,7,'l',11],[7,8,'l',8]] as [number,number,string,number][] : [])];
  const visible = exercises.map((x,i)=>({x,i})).filter(({x})=>filter==='All'||x.g===filter);
  const step = (d:number) => { const index=visible.findIndex(v=>v.i===selected); onSelect(visible[(index+d+visible.length)%visible.length].i); };
  const bodyParts: [string,string][] = [['neck','M54 34h12v14H54z'],['shoulders','M28 50h64v18H28z'],['chest','M38 66h44v22H38z'],['core','M44 91h32v28H44z'],['arms','M22 69h12v68H22z M86 69h12v68H86z'],['legs','M38 123h19v88H38z M63 123h19v88H63z']];
  const emphasis = (part:string) => { const regex:Record<string,RegExp>={neck:/neck|posture/i,shoulders:/shoulder|trap/i,chest:/chest/i,core:/core|abs|oblique/i,arms:/tricep|bicep|forearm/i,legs:/quad|glute|hamstring|calf|calves/i}; return e.m.some(([n])=>regex[part].test(n)); };
  return <div className="space-y-5">
    <div className="flex gap-2 overflow-x-auto pb-1">{['All',...new Set(exercises.map(x=>x.g))].map(g=><Button key={g} size="sm" variant={filter===g?'default':'outline'} onClick={()=>{setFilter(g); const next=exercises.findIndex(x=>g==='All'||x.g===g); if(g!=='All'&&e.g!==g)onSelect(next);}}>{g==='Face'?'Posture':g}</Button>)}</div>
    <div className="grid gap-6 xl:grid-cols-[220px_1fr]">
      <div className="max-h-[430px] overflow-y-auto space-y-1 pr-2">{visible.map(({x,i})=><Button key={x.n} variant={selected===i?'secondary':'ghost'} className="w-full justify-start whitespace-normal text-left h-auto min-h-10" onClick={()=>onSelect(i)}>{x.n}</Button>)}</div>
      <div className="min-w-0">
        <div className="arc-stage grid grid-cols-[1fr_90px] items-center border-y border-border py-6">
          <svg viewBox="0 0 300 190" className="w-full max-h-[300px]" role="img" aria-label={`${e.n} animated demonstration`}>
            <g stroke="hsl(var(--border))" fill="none" strokeWidth="2"><line x1="0" y1="172" x2="300" y2="172" strokeWidth="3"/><g dangerouslySetInnerHTML={{__html:e.x}}/></g>
            {segments.map(([a,b,group,width],i)=><line key={i} x1={points[a][0]} y1={points[a][1]} x2={points[b][0]} y2={points[b][1]} stroke={e.hl.includes(group)?'hsl(var(--primary))':'hsl(var(--secondary))'} strokeWidth={width} strokeLinecap="round"/>)}
            <circle cx={points[0][0]} cy={points[0][1]} r="11" fill="hsl(var(--foreground))"/>
          </svg>
          <svg viewBox="0 0 120 230" className="w-full" role="img" aria-label="Illustrative muscle emphasis"><circle cx="60" cy="19" r="13" fill="hsl(var(--secondary))"/>{bodyParts.map(([part,path])=><path key={part} d={path} fill={emphasis(part)?'hsl(var(--primary))':'hsl(var(--secondary))'} opacity={emphasis(part)? .55+.4*ph : .45}/>)}</svg>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-4 mt-5"><div><div className="arc-kicker">{e.g==='Face'?'Posture':e.g} / FORM STUDY</div><h2 className="text-2xl font-exo font-bold mt-1">{e.n}</h2><p className="text-primary mt-1">{prescriptions[e.n]?.[0]} <span className="text-muted-foreground text-xs ml-2">Illustrative routine</span></p></div><div className="flex gap-1"><Button variant="outline" size="icon" title="Previous exercise" aria-label="Previous exercise" onClick={()=>step(-1)}><ChevronLeft/></Button><Button variant="default" size="icon" title={playing?'Pause animation':'Play animation'} aria-label={playing?'Pause animation':'Play animation'} onClick={()=>setPlaying(!playing)}>{playing?<Pause/>:<Play/>}</Button><Button variant="outline" size="icon" title="Next exercise" aria-label="Next exercise" onClick={()=>step(1)}><ChevronRight/></Button></div></div>
        <div className="grid sm:grid-cols-3 gap-3 mt-6">{prescriptions[e.n]?.[1].map((cue,i)=><div key={cue} className="border-l-2 border-primary pl-3 text-sm"><span className="text-muted-foreground text-xs block">0{i+1}</span>{cue}</div>)}</div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-7">{e.m.map(([name,value])=><div key={name}><div className="text-xs text-muted-foreground mb-1">{name}</div><div className="h-1 bg-muted"><div className="h-full bg-primary" style={{width:`${value}%`}}/></div></div>)}</div>
        <p className="text-xs text-muted-foreground mt-3">Muscle emphasis is illustrative, not a measured activation percentage. Animation is not a form assessment.</p>
        <p className="flex gap-2 text-xs text-muted-foreground border-t border-border pt-4 mt-5"><ShieldAlert className="h-4 w-4 shrink-0"/>{e.g==='Neck'||e.g==='Face'?'Use gentle, pain-free movement. Ask a qualified clinician before neck exercises, especially after injury.':'Use rated, stable equipment—not improvised doorframes, unsecured tables, or towels on doors. Stop if painful. Adjust volume to your ability.'}</p>
      </div>
    </div>
  </div>;
}