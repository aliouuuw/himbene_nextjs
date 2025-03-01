import { getAuthenticatedUserRole } from "@/app/actions/user-actions"
import { redirect } from "next/navigation"

export default async function Home() {
  const userRole = await getAuthenticatedUserRole()
  
  // If user is authenticated, redirect to correct dashboard depending on role
  if (userRole && userRole === 'ADMIN') {
    redirect("/dashboard/admin/")
  } else if (userRole && userRole === 'INFOGRAPHE') {
    redirect("/dashboard/infographe/home")
  } else if (userRole && userRole === 'COMMERCIAL') {
    redirect("/dashboard/commercial/home")
  }
  
  // If not authenticated, redirect to sign-in
  redirect("/sign-in")
}
