"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
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