import {recordPredictions,json,sameOrigin} from '../../../../lib/history-service.js';
export async function POST(request){if(!sameOrigin(request))return json({error:'Origin not allowed'},403);try{const body=await request.json();return await recordPredictions(body.symbol);}catch{return json({error:'Forecast was not saved: verified exchange history could not be loaded. Retry later.'},503);}}
