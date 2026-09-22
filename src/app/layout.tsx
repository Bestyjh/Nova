import type { Metadata } from 'next';
import './globals.css';
import './lms.css';
export const metadata: Metadata={title:'NOVA Wellness & Lifestyle Institute',description:'Advancing Health Through Prevention, Education & Partnership'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body suppressHydrationWarning>{children}</body></html>}
