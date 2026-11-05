import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Fresnel Studios — Your work. Your business. One studio.',description:'Portfolio websites, shoot production, client management and social scheduling for photographers and studios. Explore the product preview.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
