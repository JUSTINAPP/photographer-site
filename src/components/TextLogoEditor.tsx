'use client';
import type {Website} from '@/lib/website';
import {FONT_PAIRS,type FontPair} from '@/lib/website-theme';
import {portfolioWordmark} from '@/lib/portfolio-logo';
export default function TextLogoEditor({site,onChange}:{site:Website;onChange:(patch:Partial<Website>)=>void}){
 const wordmark=portfolioWordmark(site);const text=site.logoMode==='text'||!(site.logo||site.logoDark||site.logoLight);
 return <fieldset className="design-options text-logo-editor"><legend>Text logo / name in the header</legend><p>Type your name or any word exactly as it should appear. Capitalisation is kept. Changes appear immediately in the preview.</p><div className="design-switch"><button type="button" aria-pressed={text} onClick={()=>onChange({logoMode:'text'})}>Text logo</button><button type="button" aria-pressed={!text} disabled={!(site.logo||site.logoDark||site.logoLight)} onClick={()=>onChange({logoMode:'auto'})}>Uploaded logo image</button></div>
 <label>Header name or word<input maxLength={100} value={wordmark.text} onChange={e=>onChange({wordmarkText:e.target.value,logoMode:'text'})} placeholder="e.g. david mandelberg"/></label><button className="secondary-button" type="button" onClick={()=>onChange({wordmarkText:wordmark.text.toLowerCase(),logoMode:'text'})}>Use lowercase</button>
 <label>Text logo font<select value={site.wordmarkFont} onChange={e=>onChange({wordmarkFont:e.target.value as FontPair|'site',wordmarkSpacing:null,logoMode:'text'})}><option value="site">Follow website typography</option>{Object.entries(FONT_PAIRS).map(([key,font])=><option key={key} value={key}>{font.label}</option>)}</select></label>
 <label>Letter spacing · {wordmark.spacing.toFixed(2)} em<input type="range" min="0" max="0.6" step="0.005" value={wordmark.spacing} onChange={e=>onChange({wordmarkSpacing:Number(e.target.value),logoMode:'text'})}/></label><label>Text logo size · {Math.round(Math.max(14,Math.min(44,site.logoSize*.6)))}px<input type="range" min="24" max="72" value={Math.min(72,site.logoSize)} onChange={e=>onChange({logoSize:Number(e.target.value)})}/></label>
 {!text&&<p>An uploaded image keeps its own lettering. Choose Text logo to change its font.</p>}<p>Libre Baskerville includes David’s original wide spacing. Follow website typography makes the header name change with the typography choices below.</p></fieldset>;
}
