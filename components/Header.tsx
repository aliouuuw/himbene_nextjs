import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ui/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center p-6 gap-4 h-16 border-b border-gray-200 dark:border-gray-800">
      {/* Logo link to home */}
      <Link href="/">
        <div className="relative h-16 w-16">
          <Image src="/himbene.png" alt="Himbene logo" fill className="dark:invert"/>
        </div>
      </Link>
      <div className="flex gap-2">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Button variant="ghost">
            <Link href="/sign-in">
              Se connecter
            </Link>
          </Button> 
        </SignedOut>
        <ThemeToggle />
      </div>
    </header>
  );
}
