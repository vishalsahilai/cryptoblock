import test from 'node:test';
import assert from 'node:assert/strict';
import {createResearchHandler} from './app/api/research/route.js';
const req=()=>new Request('https://example.org/api/research?symbol=ETH');
const data={symbol:'ETH',articles:[{title:'Actual source report'}],coverage:[{status:'checked'}]};
for(const [name,getCache] of [['absent',()=>undefined],['read throws',()=>({match(){throw Error('Cache unavailable');}})],['write throws',()=>({match:async()=>null,put(){throw Error('Cache write unavailable');}})]])test(`Research succeeds when cache ${name}`,async()=>{let calls=0;const get=createResearchHandler({enrich:async x=>x,getCache,research:async()=>{calls++;return data;}}),r=await get(req());assert.equal(r.status,200);assert.deepEqual(await r.json(),data);assert.equal(calls,1);});
test('Valid cache response avoids refetching',async()=>{const get=createResearchHandler({enrich:async x=>x,getCache:()=>({match:async()=>Response.json(data)}),research:()=>{throw Error('Should not fetch');}});assert.equal((await get(req())).status,200);});
test('Unsupported symbols never reach external research',async()=>{const get=createResearchHandler({enrich:async x=>x,research:()=>{throw Error('Should not fetch');}});assert.equal((await get(new Request('https://example.org/api/research?symbol=BAD'))).status,400);});
