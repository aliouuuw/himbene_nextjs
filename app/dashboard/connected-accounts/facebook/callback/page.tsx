import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectFacebookAccount } from "@/app/actions/facebook-actions";

// For App Router pages, we use this pattern
export default async function FacebookCallback({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const { code, error } = await searchParams;
  
  if (error) {
    // Handle error case
    redirect("/dashboard/connected-accounts?error=facebook_auth_denied");
  }
  
  if (!code) {
    redirect("/dashboard/connected-accounts?error=missing_code");
  }
  
  try {
    // Call server action to handle the OAuth exchange
    await connectFacebookAccount(code as string, userId);
    redirect("/dashboard/connected-accounts?success=facebook_connected");
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Facebook connection error:", error);
    redirect(`/dashboard/connected-accounts?error=facebook_connection_failed&message=${encodeURIComponent(error.message)}`);
  }
}
