"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ConnectFacebookButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConnect = () => {
    setIsLoading(true);
    
    // Facebook OAuth URL
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const redirectUri = encodeURIComponent(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connected-accounts/facebook/callback`);
    const scope = encodeURIComponent('pages_manage_posts,pages_read_engagement,pages_show_list');
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    // Redirect to Facebook login
    window.location.href = authUrl;
  };
  
  return (
    <Button 
      onClick={handleConnect} 
      disabled={isLoading}
      className="bg-[#1877F2] hover:bg-[#0E65D9] text-white"
    >
      {isLoading ? "Connecting..." : "Connect Facebook"}
    </Button>
  );
}
