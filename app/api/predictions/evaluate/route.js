import {evaluateDue,json,sameOrigin} from '../../../../lib/history-service.js';
export async function POST(request){if(!sameOrigin(request))return json({error:'Origin not allowed'},403);try{return json(await evaluateDue());}catch{return json({error:'Outcome checks are temporarily unavailable'},503);}}
