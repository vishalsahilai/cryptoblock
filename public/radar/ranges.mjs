export const RANGES={
 '1s':{label:'1 second · live',interval:1,minutes:1,live:true},
 '15m':{label:'15 minutes',interval:1,minutes:1,duration:900000},
 '1h':{label:'1 hour',interval:1,minutes:1,duration:3600000},
 '4h':{label:'4 hours',interval:5,minutes:5,duration:14400000},
 '1w':{label:'1 week',interval:60,minutes:60,duration:604800000},
 '1M':{label:'1 month',interval:240,minutes:240,months:1},
 '6M':{label:'6 months',interval:'D',minutes:1440,months:6}
};
function monthStart(now,months){const d=new Date(now),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-months);const max=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,max));return +d;}
export function rangeBounds(key,now=Date.now()){const r=RANGES[key];if(!r)throw Error('Unknown range');const ms=r.live?1000:r.minutes*60000;const start=r.live?now-120000:r.months?monthStart(now,r.months):now-r.duration;return {start:Math.floor(start/ms)*ms,end:now,step:ms};}
export function periodSnapshot(m,key,now=Date.now()){const {start,end,step}=rangeBounds(key,now);const source=RANGES[key].live?m.seconds?.candles(now):m.c;if(!source?.length)return null;const c=source.filter(v=>v.t>=start&&v.t<=end);if(!c.length)return null;const base=c[0].o,last=RANGES[key].live?c.at(-1).c:+m.ticker.lastPrice;if(!Number.isFinite(last)||!base)return null;return {c,day:c[0].t,base,last,change:(last/base-1)*100,end,step,partial:c[0].t>start};}
export class SecondBars{
 constructor(){this.bars=new Map();this.seen=new Map();}
 add(rows,now=Date.now()){for(const r of rows){const id=String(r.i??r.execId??''),t=+(r.T??r.time),p=+(r.p??r.price),v=+(r.v??r.size);if(!id||this.seen.has(id)||![t,p,v].every(Number.isFinite)||p<=0||v<=0||t<now-300000||t>now+10000)continue;this.seen.set(id,t);const start=Math.floor(t/1000)*1000,b=this.bars.get(start);if(b){if(t<b.first){b.o=p;b.first=t;}if(t>=b.last){b.c=p;b.last=t;}b.h=Math.max(b.h,p);b.l=Math.min(b.l,p);b.v+=v;}else this.bars.set(start,{t:start,o:p,h:p,l:p,c:p,v,first:t,last:t});}this.prune(now);}
 prune(now){for(const [id,t]of this.seen)if(t<now-300000)this.seen.delete(id);for(const [t]of this.bars)if(t<now-300000)this.bars.delete(t);}
 candles(now=Date.now()){this.prune(now);return [...this.bars.values()].sort((a,b)=>a.t-b.t).map(b=>({...b,closed:b.t+1000<=now}));}
}
// Monotone interpolation: passes through every sampled close without overshooting.
export function linePath(points){const p=[];for(const v of points){if(!v.every(Number.isFinite))continue;if(p.length&&v[0]===p.at(-1)[0])p[p.length-1]=v;else if(!p.length||v[0]>p.at(-1)[0])p.push(v);}if(!p.length)return '';if(p.length===1)return `M${p[0][0]},${p[0][1]}`;const d=p.slice(1).map((v,i)=>(v[1]-p[i][1])/(v[0]-p[i][0]));const m=p.map((_,i)=>i===0?d[0]:i===p.length-1?d.at(-1):d[i-1]*d[i]<=0?0:2/(1/d[i-1]+1/d[i]));let path=`M${p[0][0]},${p[0][1]}`;for(let i=0;i<p.length-1;i++){const dx=(p[i+1][0]-p[i][0])/3;path+=` C${p[i][0]+dx},${p[i][1]+m[i]*dx} ${p[i+1][0]-dx},${p[i+1][1]-m[i+1]*dx} ${p[i+1][0]},${p[i+1][1]}`;}return path;}
