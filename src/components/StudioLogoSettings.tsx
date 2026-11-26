'use client';
import './portfolio-builder.css';
import LogoKitEditor from './LogoKitEditor';
import {approveLogoKit} from '@/app/studio/settings/actions';
export default function StudioLogoSettings({id,logo,size,initialKit}:{id:string;name:string;logo:string;size:number;initialKit?:import('@/lib/logo-kit').LogoKit}){
 return <section id="logo" className="studio-panel settings-wide"><h2>Logo and browser icon</h2><LogoKitEditor logo={logo} size={size} initialKit={initialKit} onApprove={async kit=>{const result=await approveLogoKit(id,kit);if(result.error)throw Error(result.error)}}/></section>;
}
