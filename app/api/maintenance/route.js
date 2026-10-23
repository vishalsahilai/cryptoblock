import {maintenanceStatus} from '../../../lib/maintenance-service.js';
export async function GET(){return Response.json(await maintenanceStatus(),{headers:{'Cache-Control':'no-store'}});}
