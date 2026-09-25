import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function PortalHeader() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  return (
    <header className="portalHeader">
      <Link href="/" className="portalBrand">
        <Image
          src="/nova-logo.png"
          alt="NOVA Wellness & Lifestyle Institute"
          width={220}
          height={80}
          priority
        />
      </Link>

      <nav className="portalNav">
        <Link href="/learn">NOVA Learning</Link>

        {isLoggedIn ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/login">Log In</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}