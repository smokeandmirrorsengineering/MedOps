import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { Plus, ArrowUpRight, ShieldCheck } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useService } from "./ServiceProvider";
import { assetCoverage } from "./coverage";
import { registryAsset } from "./registry";
import { recordTime } from "../reviews/ReviewComponents";
import type { LifecycleRecord, ServiceCase } from "./types";
import type { Errors } from "./model";
export function ServiceHeader({title,description,actions}:{title:string;description:string;actions?:ReactNode}) {
  const service=useService();
  return <><PageHeader page={<Link to="/service">Service Operations</Link>} title={title} description={description} meta={<>Synthetic demonstration · Coverage evaluated {service.today} (Asia/Dhaka)</>} actions={actions}/><nav className="service-nav no-print" aria-label="Service Operations"><NavLink to="/service" end>Overview</NavLink><NavLink to="/service/equipment">Equipment & coverage</NavLink><NavLink to="/service/cases">Service cases</NavLink></nav><StorageNotice/></>;
}
export function NewCaseLink({assetId,reviewId,exceptionId,followUpId}:{assetId?:string;reviewId?:string;exceptionId?:string;followUpId?:string}) {
  const params=new URLSearchParams();for(const [key,value] of Object.entries({equipment:assetId,review:reviewId,exception:exceptionId,action:followUpId}))if(value)params.set(key,value);
  return <Link className="review-primary" to={`/service/cases/new${params.size?`?${params}`:""}`}><Plus size={16}/> New Service Case</Link>;
}
export function StorageNotice(){const s=useService();const state=[s.lifecycleStatus,s.caseStorageStatus];return <p className={`service-storage no-print ${state.some(s=>s==="unavailable"||s==="protected")?"service-warning":""}`} role="status">{state.includes("protected")?"Invalid or incompatible browser data retained and protected from replacement. A synthetic fallback is shown; affected store cannot be saved. Recover the original browser data before replacing it.":state.includes("unavailable")?"NOT SAVED TO BROWSER — storage is unavailable or full. Some changes are in memory only and may be lost on refresh.":"Browser-local synthetic records · Use Save to retain changes. Typed identities and administrative decisions are unverified."}</p>;}
export function Badge({children,tone="neutral"}:{children:ReactNode;tone?:string}){return <span className={`service-badge service-${tone}`}>{children}</span>;}
export function CaseBadge({status}:{status:ServiceCase["status"]}){return <Badge tone={status==="Closed administratively"?"neutral":status==="Awaiting approval"?"amber":status==="Work reported complete"?"teal":"navy"}>{status}</Badge>;}
export function CoverageBadges({record,days=90}:{record:LifecycleRecord;days?:number}){const {today}=useService();const c=assetCoverage(record,today,days);return <div className="service-coverage-badges"><Badge tone={c.warranty.status==="Expired"?"red":c.warranty.status==="Expiring soon"?"amber":"neutral"}>Warranty · {c.warranty.status==="Active"?"Warranty active":c.warranty.status}</Badge><Badge tone={c.contract.status==="Expired"?"red":c.contract.status==="Expiring soon"?"amber":"neutral"}>{record.contractType||"Service contract"} · {c.contract.status==="Active"?"Service contract active":c.contract.status}</Badge></div>;}
export function Field({label,name,error,children,hint}:{label:string;name:string;error?:string;children:ReactNode;hint?:string}){return <div className="service-field"><label htmlFor={name}>{label}</label>{children}{hint&&<small id={`${name}-hint`}>{hint}</small>}{error&&<small id={`${name}-error`} className="service-field-error" role="alert">{error}</small>}</div>;}
export function ErrorsNotice({errors}:{errors:Errors}){return Object.keys(errors).length?<div className="review-errors" role="alert">{Object.entries(errors).map(([key,value])=><p key={key}>{value}</p>)}</div>:null;}
export function Value({label,children}:{label:string;children?:ReactNode}){return <div><dt>{label}</dt><dd>{children||"Not recorded"}</dd></div>;}
export function CaseLink({record}:{record:ServiceCase}){return <Link className="service-record-link" to={`/service/cases/${record.id}`}><span><strong>{record.title}</strong><small>{record.id} · {registryAsset(record.assetId)?.name}</small></span><ArrowUpRight size={16}/></Link>;}
export function ServiceAssetLinks({assetId,onNavigate}:{assetId:string;onNavigate?:()=>void}){const s=useService();const record=s.lifecycle.find(r=>r.assetId===assetId);const cases=s.cases.filter(c=>c.assetId===assetId);return <section className="detail-section service-asset-links"><h3><ShieldCheck size={16}/> Service Coverage & Cases</h3>{record&&<CoverageBadges record={record}/>}<p>Reported availability: {record?.availability??"Not recorded"}. Independent of monitoring condition.</p><Link className="text-link" to={`/service/equipment/${assetId}`} onClick={onNavigate}>View lifecycle & coverage</Link><Link className="text-link" to={`/service/cases/new?equipment=${assetId}`} onClick={onNavigate}>Open Service Case</Link>{cases.map(c=><Link className="text-link" key={c.id} to={`/service/cases/${c.id}`} onClick={onNavigate}>{c.title} · {c.status}</Link>)}{!cases.length&&<small>No service cases recorded.</small>}</section>;}
export function EventTime({at,seed=false}:{at:string;seed?:boolean}){return <small>{recordTime(at)} · {seed?"Synthetic seed event time":"Actual record time"}</small>;}
