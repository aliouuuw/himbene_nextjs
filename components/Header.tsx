/* eslint-disable @typescript-eslint/no-explicit-any */

import { ThemeToggle } from "./ui/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserDropdown } from "./user-dropdown";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  // console.log("Session", session);
  const isConnected = session !== null;


  return (
    <header className="w-full flex justify-between items-center p-6 gap-4 h-16 border-b border-gray-200 dark:border-gray-800">
      {/* Logo link to home */}
      <Link href="/">
        <div className="relative h-16 w-16">
          <Image
            src="/himbene.png"
            alt="Himbene logo"
            fill
            className="dark:invert"
          />
        </div>
      </Link>
      <div className="flex gap-2">
        {isConnected ? (
          <UserDropdown session={session}/>
        ) : (
          <Link href="/sign-in">
            <Button variant="ghost">Se connecter</Button>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
