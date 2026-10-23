import {CRYPTO_UNIVERSE} from '../public/radar/radar.mjs';
import {validDrawings} from '../public/radar/chart-model.mjs';
export const defaults=()=>({watchlist:[],costs:{feeBps:6,slippageBps:2,fundingBps:1}});
export function validatePrefs(b){if(!b||!Array.isArray(b.watchlist)||b.watchlist.length>60||b.watchlist.some(s=>!CRYPTO_UNIVERSE.has(s)))throw Error('Invalid watchlist');const costs=b.costs??defaults().costs;for(const k of ['feeBps','slippageBps','fundingBps'])if(!Number.isFinite(costs[k])||costs[k]<0||costs[k]>100)throw Error('Cost assumptions must be 0–100 bps');return {watchlist:[...new Set(b.watchlist)],costs};}
export function validateDrawingPayload(b){if(!CRYPTO_UNIVERSE.has(b?.symbol)||!Array.isArray(b.drawings)||b.drawings.length>200||JSON.stringify(b.drawings).length>100000)throw Error('Invalid drawings');const drawings=validDrawings(b.drawings);if(drawings.length!==b.drawings.length)throw Error('Invalid drawing coordinates');return {symbol:b.symbol,drawings};}
export function expectedVersion(b){if(!Number.isInteger(b.version)||b.version<0)throw Error('A valid record version is required');return b.version;}
