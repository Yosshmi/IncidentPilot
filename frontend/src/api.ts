import { CoreService, Incident, TelemetryLog } from './types';

async function getJson<T>(url:string):Promise<T>{
  const res=await fetch(url);
  if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const api={
  incidents:()=>getJson<Incident[]>('/api/incidents'),
  services:()=>getJson<CoreService[]>('/api/services'),
  logs:()=>getJson<TelemetryLog[]>('/api/logs'),
  investigate:async(incidentId:string)=>{
    const res=await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/investigate`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
    if(!res.ok) throw new Error('Investigation failed');
    return res.json();
  }
};
