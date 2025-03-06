"use client";

/*eslint-disable @typescript-eslint/no-explicit-any*/
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useState } from "react";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

export const UserDropdown = ({ session }: { session: any }) => {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = () => {
    setIsSigningOut(true);
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
        },
        onError: () => {
          setIsSigningOut(false);
        },
      },
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full">
          {session?.user?.email?.charAt(0)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href="/dashboard">
            <Button variant="ghost">
              <User className="w-4 h-4" />
              Mon compte
            </Button>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Button 
            variant="ghost" 
            onClick={handleSignOut} 
            disabled={isSigningOut}
          > 
            <LogOut className="w-4 h-4" />
            {isSigningOut ? "Déconnexion..." : "Se déconnecter"}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};