'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, X, Lightbulb } from 'lucide-react';
import { WeekView } from './week-view';
import { MonthView } from './month-view';
import { ListView } from './list-view';
import { today, todayISO, weekDatesFor, addDays, addMonths, CHANNEL_LABELS, FORMAT_META, type SocialPost, type Media, type PostingSuggestion } from './model';
import { saveSocialPost, archiveSocialPost } from '@/app/studio/social/actions';
import { ActionButton } from '@/components/ActionFeedback';
import TeamAccessSelect from '@/components/TeamAccessSelect';
import type { GrowthRecord } from '@/lib/social-workspace';

export default function SocialCalendar({ initial, media, ideas, prefill, idea, postId }: { initial: SocialPost[]; media: Media[]; ideas: GrowthRecord[]; prefill?: string; idea?: string; postId?: string }) {
 const router=useRouter();const [posts,setPosts]=useState(initial);const [view,setView]=useState<'week'|'month'|'list'>('week');
 const [anchor,setAnchor]=useState(today);const [editing,setEditing]=useState<SocialPost|null>(null);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [suggestions,setSuggestions]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);const [selected,setSelected]=useState<string[]>([]);const [search,setSearch]=useState('');
 useEffect(()=>setPosts(initial),[initial]);
 useEffect(()=>{const timer=setInterval(()=>setAnchor(a=>new Date(a)),60000);return()=>clearInterval(timer)},[]);
 const week=useMemo(()=>weekDatesFor(anchor),[anchor]);
 function create(date=todayISO(),time='12:00',idea?:string,mediaId?:string){setMessage('');setSearch('');setSelected(mediaId?[mediaId]:[]);setEditing({id:'',title:idea??'',caption:idea??'',channel:'instagram',format:'grid',status:'draft',scheduledDate:date,scheduledTime:time,imageUrl:null});}
 function edit(post:SocialPost){setMessage('');setSearch('');setSelected(post.mediaIds??[]);setEditing(post);}
 useEffect(()=>{if(editing&&!dialog.current?.open)dialog.current?.showModal();if(!editing&&dialog.current?.open)dialog.current?.close();},[editing]);
 useEffect(()=>{if(prefill&&media.some(m=>m.id===prefill))create(todayISO(),'12:00',undefined,prefill);},[prefill]); // Open selected library media directly in a draft.
 useEffect(()=>{if(idea)create(todayISO(),'12:00',idea.slice(0,150));else if(postId){const post=initial.find(p=>p.id===postId);if(post)edit(post)}},[idea,postId]);
 const ideaSlots=ideas.filter(i=>i.kind==='idea').slice(0,7).map((idea,i)=>({date:week[i],suggestion:{day:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],time:'12:00',contentType:'grid',contentSuggestion:idea.title,reason:idea.data.notes||'From your Ideas board'} as PostingSuggestion}));
 async function submit(form:FormData){if(!editing||busy)return;setBusy(true);setMessage('');try{
 const draft={...editing,title:String(form.get('title')),caption:String(form.get('caption')),contentBrief:String(form.get('brief')),channel:String(form.get('channel')) as SocialPost['channel'],format:String(form.get('format')) as SocialPost['format'],status:String(form.get('status')) as SocialPost['status'],scheduledDate:String(form.get('date')),scheduledTime:String(form.get('time')),mediaIds:selected};
 const result=await saveSocialPost(draft);if(result.error){setMessage(result.error);return;}
 const files=selected.map(id=>media.find(m=>m.id===id)).filter((m):m is Media=>!!m);draft.id=result.id!;draft.imageUrl=files.find(m=>m.kind==='photo')?.source_url??null;draft.imageUrls=files.filter(m=>m.kind==='photo').map(m=>m.source_url);draft.videoUrl=files.find(m=>m.kind==='video')?.source_url??null;
 setPosts(old=>[...old.filter(p=>p.id!==draft.id),draft]);setEditing(null);setMessage('Post saved.');router.refresh();
 }catch{setMessage('Could not save this post. Your draft is still open; please try again.')}finally{setBusy(false)}}
 async function unschedule(){if(!editing||busy)return;setBusy(true);try{const result=await archiveSocialPost(editing.id);if(result.error){setMessage(result.error);return;}setPosts(old=>old.map(p=>p.id===editing.id?{...p,status:'draft',scheduledDate:'',scheduledTime:''}:p));setEditing(null);setMessage('Post returned to unscheduled drafts.');router.refresh();}catch{setMessage('Could not unschedule. Please try again.')}finally{setBusy(false)}}
 const scheduled=posts.filter(p=>p.scheduledDate);const drafts=posts.filter(p=>!p.scheduledDate);
 return <div className="social-calendar">
 <div className="growth-toolbar"><div className="design-switch">{(['week','month','list'] as const).map(mode=><button key={mode} aria-pressed={view===mode} className={view===mode?'is-active':''} onClick={()=>setView(mode)}>{mode}</button>)}</div><div className="growth-period"><button className="secondary-button" aria-label="Previous period" onClick={()=>setAnchor(a=>view==='month'?addMonths(a,-1):addDays(a,-7))}><ChevronLeft size={16}/></button><button className="secondary-button" onClick={()=>setAnchor(today())}>Today</button><button className="secondary-button" aria-label="Next period" onClick={()=>setAnchor(a=>view==='month'?addMonths(a,1):addDays(a,7))}><ChevronRight size={16}/></button><strong>{view==='month'?new Intl.DateTimeFormat('en-AU',{month:'long',year:'numeric'}).format(anchor):`${week[0]} to ${week[6]}`}</strong></div><button className="primary-button" onClick={()=>create(week.includes(todayISO())?todayISO():week[0])}><Plus size={16}/> New post</button></div>
 <div className="growth-toolbar"><label className="growth-toggle"><input type="checkbox" checked={suggestions} onChange={e=>setSuggestions(e.target.checked)}/><Lightbulb size={16}/> Show ideas on calendar</label><span>Times shown in Australia/Sydney · scheduled posts are reminders for manual posting.</span></div>
 {suggestions&&!ideaSlots.length&&<p>Add ideas in the Ideas board to place them in this week.</p>}
 <p role="status" aria-live="polite">{!editing&&message}</p>
 {view==='week'?<WeekView weekDates={week} posts={scheduled} onSlotClick={create} onPostClick={edit} suggestionSlots={suggestions?ideaSlots:[]} accent="#14162b" onScheduleSuggestion={(idea,date)=>create(date,idea.time,idea.contentSuggestion)}/>:view==='month'?<MonthView reference={anchor} posts={scheduled} onDayClick={date=>create(date)} onPostClick={edit}/>:<ListView posts={scheduled} onPostClick={edit}/>}
 {drafts.length>0&&<section className="studio-panel"><h2>Unscheduled drafts</h2><div className="growth-cards">{drafts.map(p=><button key={p.id} className="secondary-button" onClick={()=>edit(p)}>{p.title}</button>)}</div></section>}
 <section className="studio-panel"><h2>Feed preview</h2><p>Preview the visual order of your next posts. This shows your saved plan.</p><div className="growth-feed">{posts.filter(p=>p.status==='scheduled').sort((a,b)=>(a.scheduledDate+a.scheduledTime).localeCompare(b.scheduledDate+b.scheduledTime)).slice(0,9).map(p=><button key={p.id} onClick={()=>edit(p)}>{p.imageUrl?<img src={p.imageUrl} alt={p.title}/>:<span>{p.title}</span>}<small>{p.format?FORMAT_META[p.format].label:'Photo'} · {p.scheduledDate}</small></button>)}{!posts.some(p=>p.status==='scheduled')&&<p>Schedule a post to start your feed preview.</p>}</div></section>
 <dialog ref={dialog} className="growth-dialog" onCancel={e=>{e.preventDefault();if(!busy)setEditing(null)}} onClick={e=>{if(e.target===e.currentTarget&&!busy)setEditing(null)}} aria-labelledby="post-title">
 {editing&&<div><div className="growth-toolbar"><h2 id="post-title">{editing.id?'Edit post':'New post'}</h2><button className="secondary-button" aria-label="Close post editor" disabled={busy} onClick={()=>setEditing(null)}><X size={18}/></button></div>
 <form action={submit} className="growth-form"><label>Title<input name="title" required maxLength={150} defaultValue={editing.title}/></label><div className="growth-columns"><label>Channel<TeamAccessSelect name="channel" label="Channel" initial={editing.channel} options={Object.entries(CHANNEL_LABELS)}/></label><label>Format<TeamAccessSelect name="format" label="Format" initial={editing.format??'grid'} options={Object.entries(FORMAT_META).map(([key,value])=>[key,value.label])}/></label></div>
 <label>Caption<textarea name="caption" rows={4} maxLength={3000} defaultValue={editing.caption}/></label><label>Creative brief<textarea name="brief" rows={2} maxLength={3000} defaultValue={editing.contentBrief}/></label>
 <div className="growth-columns"><label>Date<input name="date" type="date" defaultValue={editing.scheduledDate}/></label><label>Time<input name="time" type="time" defaultValue={editing.scheduledTime}/></label></div>
 <label>Status<TeamAccessSelect name="status" label="Post status" initial={editing.status==='failed'?'draft':editing.status} options={[["draft","Draft"],["scheduled","Scheduled · manual posting"],["published","Posted · confirmed by you"]]}/></label>
 <fieldset><legend>Choose media · {selected.length}/10</legend><input aria-label="Search media" placeholder="Search your media library" value={search} onChange={e=>setSearch(e.target.value)}/><div className="growth-media-picker">{media.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())).slice(0,60).map(m=><label key={m.id}><input type="checkbox" checked={selected.includes(m.id)} disabled={!selected.includes(m.id)&&selected.length>=10} onChange={e=>setSelected(ids=>e.target.checked?[...ids,m.id]:ids.filter(id=>id!==m.id))}/>{m.kind==='photo'?<img src={m.source_url} alt="" loading="lazy"/>:<span>Video</span>}<small>{m.name}</small></label>)}</div><p>Files appear in the order selected. Untick and reselect a file to move it to the end.</p></fieldset>
 {selected.length>0&&<ol>{selected.map((id,index)=><li key={id}>{media.find(m=>m.id===id)?.name}<button type="button" disabled={index===0} onClick={()=>setSelected(ids=>{const copy=[...ids];[copy[index-1],copy[index]]=[copy[index],copy[index-1]];return copy})}>↑ Move earlier</button></li>)}</ol>}
 <p role="alert">{message}</p><div className="growth-toolbar"><ActionButton busy={busy} type="submit" className="primary-button">Save post</ActionButton>{editing.id&&<ActionButton busy={busy} type="button" className="secondary-button" onClick={unschedule}>Return to unscheduled drafts</ActionButton>}</div></form></div>}
 </dialog></div>;
}
