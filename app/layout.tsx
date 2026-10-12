import type {Metadata} from 'next';
import './globals.css';
import './signals.css';
export const metadata:Metadata={title:'Underflow — Onchain Radar',description:'Find economic activity beneath the timeline.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
