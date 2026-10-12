import {decorate,trend,retain} from './signals';
const registry:any={
 'Base:0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43':{name:'Aerodrome',purpose:'DEX router',source:'https://github.com/aerodrome-finance/contracts',token:'0x940181a94a35a4569e4529a3cdfb74e38fd98631'},
 'Base:0x940181a94a35a4569e4529a3cdfb74e38fd98631':{name:'Aerodrome',purpose:'AERO token transfers, not application usage',source:'https://github.com/aerodrome-finance/contracts',token:'0x940181a94a35a4569e4529a3cdfb74e38fd98631'},
 'Base:0x16613524e02ad97edfef371bc883f2f5d6c480a5':{name:'Aerodrome',purpose:'Liquidity incentive voting',source:'https://github.com/aerodrome-finance/contracts',token:'0x940181a94a35a4569e4529a3cdfb74e38fd98631'},
 'Ethereum:0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2':{name:'Aave V3',purpose:'Lending pool',source:'https://github.com/aave-dao/aave-address-book',token:null}
};
export async function enrich(fresh:any,old:any,db:any){
 const data=retain(fresh,old);data.projects=data.projects.map(decorate);
 const eligible=data.projects.filter((p:any)=>!p.stale&&p.meaningfulGrowth&&(p.mcap==null||p.mcap<=100e6)).sort((a:any,b:any)=>b.score-a.score).slice(0,12);
 await Promise.all(eligible.map(async(p:any)=>{
  const key='fees:'+p.id,cached=await db.prepare('SELECT updated_at,payload FROM enrichment_cache WHERE key=?').bind(key).first();
  let evidence=cached?JSON.parse(cached.payload):null;
  if(!cached||Date.now()-cached.updated_at>6*3600000||evidence?.through!==Math.floor(Date.now()/86400000)*86400000-86400000){try{
   const url='https://api.llama.fi/summary/fees/'+encodeURIComponent(p.id)+'?dataType=dailyFees';
   const r=await fetch(url,{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('HTTP '+r.status);
   const d:any=await r.json();evidence={...trend(d.totalDataChart),at:Date.now(),source:url};
   await db.prepare('INSERT INTO enrichment_cache(key,updated_at,payload) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET updated_at=excluded.updated_at,payload=excluded.payload').bind(key,evidence.at,JSON.stringify(evidence)).run();
  }catch(e){evidence={...evidence,sustained:false,coverage:'History provider unavailable',error:String(e).slice(0,100)}}}
  p.trend=evidence;
 }));
 data.projects=data.projects.map(decorate);
 data.network=data.network.map((n:any)=>({...n,contracts:(n.contracts||[]).map((c:any)=>({...c,identity:registry[n.chain+':'+c.address.toLowerCase()]||null}))}));
 return data;
}
