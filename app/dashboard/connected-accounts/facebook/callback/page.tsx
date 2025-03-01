import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectFacebookAccount } from "@/app/actions/facebook-actions";
import { NextPage } from 'next';

interface PageProps {
  searchParams: {
    code?: string;
    error?: string;
  };
}

const FacebookCallback: NextPage<PageProps> = async ({
  searchParams,
}) => {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const { code, error } = searchParams;
  
  if (error) {
    // Handle error case
    redirect("/dashboard/connected-accounts?error=facebook_auth_denied");
  }
  
  if (!code) {
    redirect("/dashboard/connected-accounts?error=missing_code");
  }
  
  try {
    // Call server action to handle the OAuth exchange
    await connectFacebookAccount(code, userId);
    redirect("/dashboard/connected-accounts?success=facebook_connected");
  } catch (e: unknown) {
    const error = e as Error;
    console.error("Facebook connection error:", error);
    redirect(`/dashboard/connected-accounts?error=facebook_connection_failed&message=${encodeURIComponent(error.message)}`);
  }
};

export default FacebookCallback;
