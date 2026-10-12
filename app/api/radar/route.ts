import {env} from 'cloudflare:workers';
import {collect} from '../../../lib/collect';
import {enrich} from '../../../lib/enrich';
import {encode,decode} from '../../../lib/storage';
export const dynamic='force-dynamic';
export async function GET(){try{if(!env.DB)throw Error('Database not bound');const row=await env.DB.prepare('SELECT payload FROM snapshots ORDER BY created_at DESC LIMIT 1').first<any>();return Response.json(row?{...await decode(row.payload),cached:true}:{empty:true})}catch{return Response.json({error:'Snapshot storage unavailable'},{status:503})}}
export async function POST(){try{if(!env.DB)throw Error('Database not bound');const last=await env.DB.prepare('SELECT created_at,payload FROM snapshots ORDER BY created_at DESC LIMIT 1').first<any>();const old=last?await decode(last.payload):null;if(last&&Date.now()-last.created_at<5*60000)return Response.json({...old,cached:true});const data=await enrich(await collect(),old,env.DB);await env.DB.prepare('INSERT INTO snapshots(created_at,payload) VALUES (?,?)').bind(data.at,await encode(data)).run();await env.DB.prepare('DELETE FROM snapshots WHERE id NOT IN (SELECT id FROM snapshots ORDER BY created_at DESC LIMIT 180)').run();return Response.json(data)}catch(e){return Response.json({error:'Refresh failed: '+String(e)},{status:503})}}
