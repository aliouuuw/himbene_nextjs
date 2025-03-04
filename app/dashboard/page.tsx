import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthenticatedUsersAccount } from "@/lib/auth";
import { getAuthenticatedUserRole } from "../actions/user-actions";

export default async function Dashboard({ children }: { children: React.ReactNode }) {
    const userRole = await getAuthenticatedUserRole()
    const account = await getAuthenticatedUsersAccount()
  
  // Check if password change is required for all users
  if (account?.passwordChangeRequired) {
    redirect('/dashboard/admin/password-change');
  }
  
  // For the root dashboard path only, redirect based on role
  const headersList = await headers();
  const pathname = headersList.get("referer") || headersList.get("host") || "";
  console.log("pathname", pathname)
  
  if (pathname.includes('/dashboard')) {
    if (userRole === 'ADMIN') {
      redirect("/dashboard/admin");
    } else if (userRole === 'INFOGRAPHE') {
      redirect("/dashboard/infographe/home");
    } else if (userRole === 'COMMERCIAL') {
      redirect("/dashboard/commercial/home");
    }
  }
  return <>{children}</>
}