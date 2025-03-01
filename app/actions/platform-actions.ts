"use server";

import { auth } from "@clerk/nextjs/server";
import { Platform } from "@prisma/client";
import prismaClient from "@/lib/prisma-client";
import { revalidatePath } from "next/cache";

export async function connectPlatform(platform: Platform) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Generate state parameter to prevent CSRF
    const state = Math.random().toString(36).substring(7);
    
    // Store state in session or database to verify later
    
    switch (platform) {
        case "FACEBOOK":
            const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
            const fbRedirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/commercial/platforms/facebook/callback`;
            const fbUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbAppId}&redirect_uri=${fbRedirectUri}&state=${state}&scope=pages_manage_posts,pages_read_engagement`;
            return { url: fbUrl };
            
        // Add other platforms here
        default:
            throw new Error("Platform not supported");
    }
}

export async function disconnectPlatform(connectionId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        await prismaClient.platformConnection.delete({
            where: {
                id: connectionId,
                userId,
            },
        });

        revalidatePath("/dashboard/commercial/platforms");
        return { success: true };
    } catch (error) {
        console.error("Failed to disconnect platform:", error);
        throw new Error("Failed to disconnect platform");
    }
}