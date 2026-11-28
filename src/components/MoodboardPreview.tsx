import SmartImage from '@/components/SmartImage';
import type {RecordData,BoardImage} from '@/lib/studio-records';
export default function MoodboardPreview({data,example=false}:{data:RecordData;example?:boolean}){
 const images=(data.images||[]) as BoardImage[];
 return <article className={'document-preview moodboard-paper '+String(data.layout||'editorial')}>
 <p className="eyebrow">{example?'ILLUSTRATIVE EXAMPLE / ':'CREATIVE DIRECTION / '}{String(data.direction||'photography')}</p>
 <h2>{String(data.title||'Your shoot direction')}</h2><p className="board-brief">{String(data.brief||'Describe the story, mood and purpose of the shoot.')}</p>
 <div className="board-direction-notes">{[['lighting','Light'],['palette','Colour'],['styling','Styling'],['composition','Framing'],['setting','Location']].filter(([key])=>data[key]).map(([key,label])=><div key={key}><strong>{label}</strong><p>{String(data[key])}</p></div>)}</div>
 <div className="moodboard-images">{images.map((img,i)=><figure key={i}>{img.url?<SmartImage variant="card" src={img.url} alt={img.caption||'Creative reference'}/>:<div className="board-link-reference"><span>REFERENCE LINK</span><strong>{img.category||'Inspiration'}</strong><p>Open source to view this reference.</p></div>}<figcaption><strong>{img.category||'Reference'}</strong>{img.caption&&<p>{img.caption}</p>}{!img.source&&img.credit&&<p className="board-credit">{img.credit}</p>}{img.source&&<a href={img.source} target="_blank" rel="noopener noreferrer">{img.credit||'View source'} ↗</a>}</figcaption></figure>)}</div>
 {!images.length&&<div className="board-empty-preview">Your photographs and references will appear here.</div>}
 {!!data.notes&&<section className="board-creative-notes"><strong>Direction for the shoot</strong><p>{String(data.notes)}</p></section>}
 {example&&<p className="tool-footnote">Sample concept imagery · an example of the presentation you can create.</p>}
 </article>;
}
