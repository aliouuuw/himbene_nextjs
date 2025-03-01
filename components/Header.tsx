import { SignedIn, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ui/theme-toggle";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center p-6 gap-4 h-16 border-b border-gray-200 dark:border-gray-800">
      {/* Logo link to home */}
      <Link href="/">
        <div className="relative h-16 w-16">
          <Image src="/himbene.png" alt="Himbene logo" fill />
        </div>
      </Link>
      <div className="flex gap-2">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <ThemeToggle />
      </div>
    </header>
  );
}
