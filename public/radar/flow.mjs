// Observed taker-side base volume, never a count of unique people.
export class TradeFlow {
 constructor({windowMs=300000,limit=1000}={}){this.windowMs=windowMs;this.limit=limit;this.trades=new Map();}
 add(rows,now=Date.now()){
  for(const r of rows){const id=r.execId??r.i,time=+(r.time??r.T),size=+(r.size??r.v),side=r.side??r.S;if(!id||!Number.isFinite(time)||!Number.isFinite(size)||size<=0||!['Buy','Sell'].includes(side)||time<now-this.windowMs||time>now+10000)continue;const price=+(r.price??r.p);this.trades.set(String(id),{time,size,side,price:Number.isFinite(price)&&price>0?price:null});}
  this.prune(now);
 }
 prune(now){for(const [id,t]of this.trades)if(t.time<now-this.windowMs)this.trades.delete(id);if(this.trades.size>this.limit){const sorted=[...this.trades].sort((a,b)=>b[1].time-a[1].time);this.trades=new Map(sorted.slice(0,this.limit));}}
 summary(now=Date.now()){this.prune(now);let buy=0,sell=0,quoteBuy=0,quoteSell=0,oldest=Infinity,newest=0;for(const t of this.trades.values()){if(t.side==='Buy'){buy+=t.size;quoteBuy+=t.size*(t.price??0);}else{sell+=t.size;quoteSell+=t.size*(t.price??0);}oldest=Math.min(oldest,t.time);newest=Math.max(newest,t.time);}const total=buy+sell;return {buy,sell,quoteBuy,quoteSell,total,buyPct:total?buy/total*100:null,sellPct:total?sell/total*100:null,count:this.trades.size,oldest:total?oldest:null,newest:total?newest:null};}
}
