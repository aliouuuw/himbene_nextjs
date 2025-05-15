"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth-context';
import Link from 'next/link';

interface LogoutButtonProps {
  redirectTo?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function LogoutButton({ 
  redirectTo = '/',
}: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();
  
  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const success = await logout();
      
      if (success) {
        router.replace(redirectTo);
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <Link href={redirectTo} onClick={handleLogout}> 
      Logout
    </Link>
  );
} 