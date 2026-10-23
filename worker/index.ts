import handler from "vinext/server/fetch-handler";
import {runMaintenance} from "../lib/maintenance-service.js";
export default {
 fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){
  // ChatGPT identity headers cannot authenticate public standalone callers.
  // Internal Cloudflare Cron replaces the platform MCP maintenance writer.
  if(new URL(request.url).pathname.replace(/\/$/,"")==="/mcp")return new Response("Not available on standalone hosting",{status:404});
  const headers=new Headers(request.headers);
  for(const name of [...headers.keys()])if(name.toLowerCase().startsWith("oai-"))headers.delete(name);
  return handler.fetch(new Request(request,{headers}),env,ctx);
 },
 scheduled(_event:ScheduledController,_env:Cloudflare.Env,ctx:ExecutionContext){
  ctx.waitUntil(runMaintenance().then(report=>{if(report.error||report.failed?.length)console.error("CryptoBlock maintenance incomplete",JSON.stringify(report));}));
 }
};
