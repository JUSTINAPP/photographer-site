'use client';
import { useActionState } from 'react';
import { saveGrowthRecord, archiveGrowthRecord } from '@/app/studio/social/actions';
import { SubmitButton } from './ActionFeedback';
import TeamAccessSelect from './TeamAccessSelect';
import type { GrowthRecord } from '@/lib/social-workspace';
export function GrowthForm({kind,record,pillars=[]}: {kind:string;record?:GrowthRecord;pillars?:GrowthRecord[]}) {
 const [state,action]=useActionState(saveGrowthRecord.bind(null,kind),{message:''});
 return <form action={action} className="growth-form">
 {record&&<input type="hidden" name="id" value={record.id}/>}
 {kind==='guidelines'?<input type="hidden" name="title" value="Studio guidelines"/>:<label>{kind==='pillar'?'Content pillar':kind==='review'?'Review title':'Title'}<input name="title" required maxLength={180} defaultValue={record?.title}/></label>}
 {kind==='idea'&&<label>Content pillar<TeamAccessSelect name="pillar" label="Content pillar" initial={record?.data.pillar??''} options={[["","Uncategorised"],...pillars.map(p=>[p.id,p.title] as [string,string])]}/></label>}
 {kind==='guidelines'?<>{[['voice','Voice and tone'],['photography','Photography direction'],['palette','Brand colours and type'],['cadence','Posting rhythm and approvals']].map(([key,label])=><label key={key}>{label}<textarea name={key} rows={3} maxLength={5000} defaultValue={record?.data[key]}/></label>)}</>:<label>{kind==='review'?'Review and response notes':'Notes / creative direction'}<textarea name="notes" maxLength={5000} rows={3} defaultValue={record?.data.notes}/></label>}
 {kind==='review'&&<><label>Client<input name="author" defaultValue={record?.data.author}/></label><label>Rating<TeamAccessSelect name="rating" label="Rating" initial={record?.data.rating??'5'} options={['5','4','3','2','1'].map(n=>[n,n+' stars'])}/></label></>}
 <SubmitButton className="primary-button">Save {kind==='guidelines'?'guidelines':kind}</SubmitButton><p role="status">{state.message}</p>
 </form>;
}
export function ArchiveGrowth({id}:{id:string}){return <form action={archiveGrowthRecord.bind(null,id)}><SubmitButton className="secondary-button">Archive</SubmitButton></form>}
export function ConnectionForm({service,record}:{service:string;record?:GrowthRecord}){
 const [state,action]=useActionState(saveGrowthRecord.bind(null,'connection'),{message:''});
 return <form action={action} className="growth-form"><input type="hidden" name="title" value={service}/>{record&&<input type="hidden" name="id" value={record.id}/>}<label>{service==='website-analytics'?'GA4 property ID':service==='search-console'?'Search Console property':'Account / profile identifier'}<input name="property" required defaultValue={record?.data.property} placeholder={service==='search-console'?'sc-domain:yourwebsite.com':service==='website-analytics'?'123456789':''}/></label><label>Account dashboard link<input name="url" type="url" defaultValue={record?.data.url} placeholder="https://"/></label><SubmitButton className="primary-button">Save account settings</SubmitButton><p role="status">{state.message}</p></form>;
}
