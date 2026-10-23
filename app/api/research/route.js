import {enrichResearch} from '../../../lib/article-evidence.mjs';
import {researchCoin} from '../../../lib/news-research.mjs';
import {CRYPTO_UNIVERSE} from '../../../public/radar/radar.mjs';

// Dispatch environments may not expose the Workers Cache API. Caching must
// never prevent an otherwise valid research request from reaching its sources.
export function createResearchHandler({research=researchCoin,getCache=()=>globalThis.caches?.default,enrich=enrichResearch}={}){
  return async function GET(request){
    const symbol=new URL(request.url).searchParams.get('symbol');
    if(!symbol||!CRYPTO_UNIVERSE.has(symbol))return Response.json({error:'Unsupported coin'},{status:400});
    const key=new Request(new URL('/api/research?symbol='+symbol+'&v=3',request.url));
    let cache;
    try{cache=getCache();const cached=await cache?.match(key);if(cached)return cached;}catch{/* Optional cache unavailable. Continue with source research. */}
    try{
      const data=await enrich(await research(symbol));
      const res=Response.json(data,{headers:{'Cache-Control':'public, max-age=300'}});
      if(data.coverage.some(x=>x.status==='checked')){
        try{await cache?.put(key,res.clone());}catch{/* Return the successful research even if cache storage fails. */}
      }
      return res;
    }catch(e){
      console.error('Research request failed',{symbol,message:e instanceof Error?e.message:'Unknown research failure'});
      return Response.json({error:'News research is unavailable. Please retry shortly.'},{status:503});
    }
  };
}
export const GET=createResearchHandler();
