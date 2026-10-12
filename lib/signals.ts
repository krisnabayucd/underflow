export function momentum(p:any) {
 const g=p.feeChange, previous=g!=null&&g>-100&&p.fees7d!=null?p.fees7d/(1+g/100):null;
 return {previous,meaningful:previous!=null&&previous>=700&&p.fees7d-previous>=700};
}
export function decorate(p:any) {
 const m=momentum(p),growth=p.feeChange>0&&!m.meaningful?0:(p.feeChange||0);
 const score=Math.round(Math.max(0,Math.min(100,(p.fees>0?25:0)+(p.revenue>0?15:0)+Math.max(-20,Math.min(35,growth/2))+Math.max(-10,Math.min(15,(p.tvlChange||0)/2))+(p.mcap>0&&p.mcap<=100e6?10:0))));
 const reason=p.stale?'Cached metrics · provider unavailable':p.trend?.sustained?'Fees above baseline for 3 days':p.feeChange>0&&!m.meaningful?'Growth below baseline threshold':m.meaningful?'Weekly fees growing · daily trend unconfirmed':p.fees>0?'Fee-generating · no sustained lift confirmed':'Fee activity unreported';
 return {...p,score,reason,meaningfulGrowth:m.meaningful};
}
export function trend(points:any[],now=Date.now()) {
 const today=Math.floor(now/86400000)*86400,map=new Map<number,number>();
 for(const [t,v] of points||[])if(Number.isFinite(t)&&Number.isFinite(v)&&t<today)map.set(Math.floor(t/86400)*86400,v);
 const days=Array.from({length:10},(_,i)=>today-(10-i)*86400);
 if(days.some(d=>!map.has(d)))return {sustained:false,coverage:'Incomplete daily history'};
 const baseline=days.slice(0,7).reduce((a,d)=>a+map.get(d)!,0)/7,recent=days.slice(7).map(d=>map.get(d)!);
 return {baseline,recent,sustained:baseline>=100&&recent.every(v=>v>=baseline*1.3&&v-baseline>=100),coverage:'10 complete UTC days',through:today*1000-86400000};
}
export function changeSince(p:any,previous:any) {
 if(!previous||p.stale)return '';
 const old=previous[p.id];if(!old)return 'New';
 if(old.stale||p.metricAt?.fees===old.at)return '';
 return p.score-old.score>=5?'Strengthening':p.score-old.score<=-5?'Fading':'';
}
export function retain(fresh:any,old:any) {
 const specs:any={'DefiLlama protocols':['mcap','tvl','tvlChange'],'DefiLlama fees':['fees','fees7d','fees30d','feeChange'],'DefiLlama revenue':['revenue']};
 const previous=new Map((old?.projects||[]).map((p:any)=>[p.id,p]));
 const indexFailed=fresh.sources.find((s:any)=>s.name==='DefiLlama protocols')?.status!=='ok';
 if(indexFailed){fresh.projects=old?.projects||[];for(const s of fresh.sources)if(s.status==='ok'){s.status='unavailable';s.error='Protocol index unavailable; previous joined metrics retained'}}
 fresh.projects=fresh.projects.map((p:any)=>{const before:any=previous.get(p.id),next:any={...p,metricAt:{},stale:false};for(const [name,fields] of Object.entries(specs) as any){const ok=fresh.sources.find((s:any)=>s.name===name)?.status==='ok',key=name.split(' ')[1];next.metricAt[key]=ok?fresh.at:(before?.metricAt?.[key]||old?.at||null);if(!ok){next.stale=true;for(const f of fields)next[f]=before?.[f]??null}}return next});
 fresh.sources=fresh.sources.map((s:any)=>{const previous=old?.sources?.find((x:any)=>x.name===s.name),lastSuccessAt=s.status==='ok'?s.at:previous?.lastSuccessAt||(previous?.status==='ok'?previous.at:null);return {...s,lastSuccessAt,status:s.status!=='ok'&&lastSuccessAt?'stale':s.status}});
 for(const [key,id] of [['watch','address'],['network','chain']])fresh[key]=fresh[key].map((x:any)=>{const before=old?.[key]?.find((v:any)=>v[id]===x[id]);if(x.status==='unavailable'&&before&&['ok','stale'].includes(before.status))return {...before,status:'stale',error:x.error,at:before.at||old.at};return {...x,at:fresh.at}});
 return fresh;
}
