import Image from "next/image";
import Link from "next/link";
export default function PortalHeader(){return <header className="portalHeader"><div className="wrap"><Link className="portalLogo" href="/"><Image src="/nova-logo.png" alt="NOVA Wellness & Lifestyle Institute" width={280} height={100}/></Link><nav className="portalNav"><Link href="/learn">NOVA Learning</Link><Link href="/login">Log In</Link><Link className="portalPrimary" href="/signup">Sign Up</Link></nav></div></header>}
