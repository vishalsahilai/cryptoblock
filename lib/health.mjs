export function maintenanceHealth(last,backup,now=Date.now()){
 const issues=[];if(!last)issues.push('No maintenance run recorded');else{if(now-last.started_at>90*60000)issues.push('Hourly tracking overdue');if(!last.finished_at&&now-last.started_at>10*60000)issues.push('Maintenance run stalled');const p=last.payload??{};if(p.error)issues.push('Maintenance failed');if(p.failed?.length)issues.push('Forecast feeds unavailable for '+p.failed.join(', '));if(p.outcomes?.unavailable)issues.push('Some due outcomes could not be verified');if(p.alerts?.unavailable)issues.push('Some alerts lack fresh market data');}
 if(!backup?.createdAt||now-backup.createdAt>36*3600000)issues.push('Daily backup missing or overdue');
 return {state:issues.length?'Needs attention':'Healthy',issues,checkedAt:now,backupAt:backup?.createdAt??null};
}
