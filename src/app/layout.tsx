import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'photographer-site — Image makers. In motion.',description:'A premium photography portfolio and production studio. Concept imagery is AI generated.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
