"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { ConnectFacebookButton } from '@/components/connect-facebook-button';

export default function SMPlatformManagement() {
  const handleConnect = (platform: string) => {
    // Handle account connection for the specified platform
    console.log(platform);
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between py-4">
          <span className="font-medium">Facebook</span>
          <ConnectFacebookButton />
        </div>
        <Separator />
        <div className="flex items-center justify-between py-4">
          <span className="font-medium">Twitter</span>
          <Button onClick={() => handleConnect('twitter')}>Connect</Button>
        </div>
        <Separator />
        <div className="flex items-center justify-between py-4">
          <span className="font-medium">Instagram</span>
          <Button onClick={() => handleConnect('instagram')}>Connect</Button>
        </div>
      </div>
    </div>
  );
}
