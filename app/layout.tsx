import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'CryptoBlock — Crypto Market Intelligence',description:'Crypto market radar, measured trade pressure and a permanent forecast track record.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body style={{margin:0}}>{children}</body></html>;}
