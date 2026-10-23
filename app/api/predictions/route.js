import {listHistory,json} from '../../../lib/history-service.js';
export async function GET(request){try{return await listHistory(new URL(request.url));}catch{return json({error:'Prediction history is temporarily unavailable'},503);}}
