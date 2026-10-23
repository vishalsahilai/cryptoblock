import {env} from 'cloudflare:workers';
import {verifiedUser,sameOriginWrite} from './auth-core.mjs';
export const db=()=>{if(!env.DB)throw Error('Account database unavailable');return env.DB;};
export const json=(d,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
export async function requireAccount(request,write=false){if(write&&!sameOriginWrite(request))return {error:json({error:'Invalid request origin'},403)};const user=await verifiedUser(request,env);return user?{user}:{error:json({error:'Sign in to save or view your private account data'},401)};}
