"use client";

import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  adminOnly = false,
  redirectTo = '/admin/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace(redirectTo);
      } else if (adminOnly && !isAdmin) {
        router.replace('/unauthorized');
      }
    }
  }, [isAuthenticated, isAdmin, loading, adminOnly, redirectTo, router]);
  
  // Show nothing while checking authentication
  if (loading || !isAuthenticated || (adminOnly && !isAdmin)) {
    return null;
  }
  
  return <>{children}</>;
} 