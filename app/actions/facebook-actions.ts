// app/actions/facebook-actions.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import prismaClient from "@/lib/prisma-client";
import { revalidatePath } from "next/cache";

export async function connectFacebookAccount(code: string, userId: string) {
  // Verify user is authenticated
  const { userId: authUserId } = await auth();
  if (!authUserId || authUserId !== userId) {
    throw new Error("Unauthorized");
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://graph.facebook.com/v18.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/connected-accounts/facebook/callback`,
        code
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`Failed to exchange code: ${errorData.error?.message || tokenResponse.statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Get long-lived token
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
    );
    
    if (!longLivedTokenResponse.ok) {
      const errorData = await longLivedTokenResponse.json();
      throw new Error(`Failed to get long-lived token: ${errorData.error?.message || longLivedTokenResponse.statusText}`);
    }
    
    const longLivedTokenData = await longLivedTokenResponse.json();
    
    // Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedTokenData.access_token}`
    );
    
    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json();
      throw new Error(`Failed to get pages: ${errorData.error?.message || pagesResponse.statusText}`);
    }
    
    const pagesData = await pagesResponse.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error("No Facebook pages found. You need to have admin access to at least one Facebook page.");
    }
    
    // Store each page as a separate connection
    for (const page of pagesData.data) {
      // Check if connection already exists
      const existingConnection = await prismaClient.platformConnection.findFirst({
        where: {
          userId,
          platform: "FACEBOOK",
          platformAccountId: page.id
        }
      });
      
      if (existingConnection) {
        // Update existing connection
        await prismaClient.platformConnection.update({
          where: { id: existingConnection.id },
          data: {
            accessToken: page.access_token, // Page tokens don't expire
            tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
            platformAccountName: page.name,
            metadata: JSON.stringify({
              category: page.category,
              pageUrl: `https://facebook.com/${page.id}`
            })
          }
        });
      } else {
        // Create new connection
        await prismaClient.platformConnection.create({
          data: {
            userId,
            platform: "FACEBOOK",
            accessToken: page.access_token,
            tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
            platformAccountId: page.id,
            platformAccountName: page.name,
            metadata: JSON.stringify({
              category: page.category,
              pageUrl: `https://facebook.com/${page.id}`
            })
          }
        });
      }
    }
    
    // Revalidate the connected accounts page
    revalidatePath("/dashboard/connected-accounts");
    
    return { success: true };
  } catch (error) {
    console.error("Facebook connection error:", error);
    throw error;
  }
}