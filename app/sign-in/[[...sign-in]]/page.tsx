"use client"

import { SignIn } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { useTheme } from "next-themes";

export default function SignInPage() {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <SignIn
        appearance={{
          baseTheme: theme === "dark" ? dark : undefined,
        }}
      />
    </div>
  );
}