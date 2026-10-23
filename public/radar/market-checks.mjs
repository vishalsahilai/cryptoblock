import {setup,parseBybit} from './scanner.mjs';
export function timeframeEvidence(rows,minutes,now=Date.now()){
 const candles=parseBybit(rows,minutes,now).filter(c=>c.closed);
 if(candles.length<50)throw Error('Fewer than 50 closed candles');
 if(now-(candles.at(-1).t+minutes*60000)>minutes*60000*2)throw Error('Stale candles');
 if(candles.some((c,i)=>i&&c.t-candles[i-1].t!==minutes*60000))throw Error('Candle gaps');
 const a=setup(candles);return {bias:a.bias,score:a.score,status:a.status,closedAt:candles.at(-1).t+minutes*60000};
}
export function liquidityEvidence(book,at,now=Date.now(),orderUsd=1000){
 if(!book||now-at>10000)return null;
 const bids=book.b.filter(x=>x[0]>0&&x[1]>0).sort((a,b)=>b[0]-a[0]),asks=book.a.filter(x=>x[0]>0&&x[1]>0).sort((a,b)=>a[0]-b[0]);
 if(!bids.length||!asks.length||asks[0][0]<=bids[0][0])return null;
 const mid=(bids[0][0]+asks[0][0])/2,spreadBps=(asks[0][0]-bids[0][0])/mid*10000;
 const depth=side=>side.filter(([p])=>Math.abs(p/mid-1)<=.005).reduce((s,[p,q])=>s+p*q,0);
 const impact=(side,buy)=>{let remaining=orderUsd,quantity=0,spent=0;for(const [p,q] of side){const take=Math.min(remaining,p*q);quantity+=take/p;spent+=take;remaining-=take;if(remaining<.000001)break;}return remaining>.01?null:Math.max(0,(buy?spent/quantity/mid-1:1-spent/quantity/mid)*10000);};
 const buyImpact=impact(asks,true),sellImpact=impact(bids,false),bidDepth=depth(bids),askDepth=depth(asks);
 return {spreadBps,bidDepth,askDepth,buyImpact,sellImpact,orderUsd,pass:spreadBps<=10&&Math.min(bidDepth,askDepth)>=50000&&buyImpact!=null&&sellImpact!=null&&Math.max(buyImpact,sellImpact)<=20};
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function checksMarkup(m,{demo,book,at}){
 const frames=[['15m',15],['1h',60],['4h',240],['1D',1440]],rows=frames.map(([label])=>m.timeframes?.[label]),valid=rows.filter(r=>r?.bias),bull=valid.filter(r=>r.bias==='Bullish').length,bear=valid.filter(r=>r.bias==='Bearish').length;
 const agreement=valid.length===4?(bull===4?'4/4 bullish agreement':bear===4?'4/4 bearish agreement':'Mixed timeframe directions'):'Agreement incomplete';
 const l=demo?null:liquidityEvidence(book,at),num=n=>n==null?'Insufficient visible depth':n.toFixed(2)+' bps';
 return `<section class="marketChecks"><div class="panelHeading"><h3>Multi-timeframe agreement</h3><button id="refreshChecks">Refresh analysis</button></div><b>${demo?'Synthetic demo · ':''}${agreement}</b><div class="timeframeGrid">${frames.map(([label],i)=>`<article><b>${label}</b><strong class="${rows[i]?.bias==='Bullish'?'green':rows[i]?.bias==='Bearish'?'red':''}">${esc(rows[i]?.bias??'Unavailable')}</strong><small>${rows[i]?.bias?'Setup '+rows[i].score+'/100 · '+esc(rows[i].status)+'<br>Closed '+new Date(rows[i].closedAt).toISOString().slice(0,16)+' UTC':esc(rows[i]?.error??(m.checksLoading?'Loading closed candles…':'Not loaded'))}</small></article>`).join('')}</div><p class="detailNote">EMA trend and order-block rules on independent closed-candle histories. Agreement is context, not forecast accuracy. Refresh to renew this snapshot.</p><h3>Liquidity & execution quality</h3>${l?`<b class="${l.pass?'green':'red'}">${l.pass?'Meets displayed liquidity thresholds':'Liquidity filter: caution'}</b><p>Spread ${num(l.spreadBps)} · visible bid depth within 0.5% $${Math.round(l.bidDepth).toLocaleString()} · ask depth $${Math.round(l.askDepth).toLocaleString()}</p><p>$1,000 market-order scenario: buy ${num(l.buyImpact)} / sell ${num(l.sellImpact)} estimated impact from mid-price, including spread.</p>`:`<p>${demo?'Live liquidity is unavailable in synthetic demo.':'Waiting for a valid order book less than 10 seconds old. Liquidity checks unavailable.'}</p>`}<p class="detailNote">Bybit perpetual top 50 levels only. Thresholds: spread ≤10 bps, depth ≥$50,000 each side within 0.5%, $1,000 impact ≤20 bps each side. Partial depth can understate liquidity. Estimates exclude fees and funding; orders can change before execution. No orders are placed.</p></section>`;
}
