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

export async function createFacebookPost(formData: FormData) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const content = formData.get('content') as string;
    const files = formData.getAll('files') as File[];
    
    const fileBuffers = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        return Buffer.from(bytes);
      })
    );

    const testConnection = {
      accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      platformAccountId: process.env.FACEBOOK_PAGE_ID
    };

    if (!testConnection.accessToken) {
      throw new Error('Facebook access token not found');
    }

    try {
      // First, upload all images and get their IDs
      const mediaIds = await Promise.all(
        fileBuffers.map(async (buffer) => {
          const photoFormData = new FormData();
          photoFormData.append('source', new Blob([buffer]));
          photoFormData.append('access_token', testConnection.accessToken!);
          photoFormData.append('published', 'false'); // Don't publish immediately

          const response = await fetch(
            `https://graph.facebook.com/${testConnection.platformAccountId}/photos`,
            {
              method: 'POST',
              body: photoFormData,
            }
          );

          if (!response.ok) {
            throw new Error(`Facebook API error: ${response.statusText}`);
          }

          const data = await response.json();
          return data.id;
        })
      );

      // Then create the post with all media attached
      const postResponse = await fetch(
        `https://graph.facebook.com/${testConnection.platformAccountId}/feed`,
        {
          method: 'POST',
          body: JSON.stringify({
            message: content,
            attached_media: mediaIds.map(id => ({ media_fbid: id })),
            access_token: testConnection.accessToken,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!postResponse.ok) {
        throw new Error(`Facebook API error: ${postResponse.statusText}`);
      }

      const fbResponse = await postResponse.json();
      console.log('Facebook post created:', fbResponse);
    } catch (error) {
      console.error(`Failed to post to Facebook:`, error);
      throw error;
    }

    revalidatePath('/dashboard/admin');
    return { success: true };
  } catch (error) {
    console.error('Create post error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create post' 
    };
  }
} 