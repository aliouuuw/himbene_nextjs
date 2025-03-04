import { authClient } from "@/lib/auth-client";
import prismaClient from "@/lib/prisma-client";
import { PlatformConnections } from "./PlatformConnections";
import { Platform } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function CommercialUserPlatformsPage() {
    const { data: session } = authClient.useSession();
    if (!session) redirect("/");

    const connections = await prismaClient.platformConnection.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Social Media Platforms</h1>
            </div>
            
            <div className="grid gap-6">
                <PlatformConnections 
                    connections={connections}
                    availablePlatforms={Object.values(Platform)}
                />
            </div>
        </div>
    );
}