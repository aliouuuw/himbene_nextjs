import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeToggle } from "./ui/theme-toggle";

export default function Header() {
  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16 border-b border-gray-200 dark:border-gray-800">
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <ThemeToggle />
    </header>
  );
} 