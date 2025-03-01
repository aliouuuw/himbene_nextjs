"use client";

import { Platform, PlatformConnection } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { connectPlatform, disconnectPlatform } from "@/app/actions/platform-actions";
import { toast } from "sonner";

interface PlatformConnectionsProps {
    connections: PlatformConnection[];
    availablePlatforms: Platform[];
}

const PLATFORM_CONFIG = {
    FACEBOOK: {
        name: "Facebook",
        icon: Facebook,
        color: "text-blue-600",
        scopes: "pages_manage_posts,pages_read_engagement",
    },
    INSTAGRAM: {
        name: "Instagram",
        icon: Instagram,
        color: "text-pink-600",
        scopes: "instagram_basic,instagram_content_publish",
    },
    TWITTER: {
        name: "Twitter",
        icon: Twitter,
        color: "text-sky-500",
        scopes: "",
    },
    LINKEDIN: {
        name: "LinkedIn",
        icon: Linkedin,
        color: "text-blue-700",
        scopes: "w_member_social",
    },
} as const;

export function PlatformConnections({ connections, availablePlatforms }: PlatformConnectionsProps) {
    const handleConnect = async (platform: Platform) => {
        try {
            const result = await connectPlatform(platform);
            if (result.url) {
                window.location.href = result.url;
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to initiate platform connection");
        }
    };

    const handleDisconnect = async (connectionId: string) => {
        try {
            await disconnectPlatform(connectionId);
            toast.success("Platform disconnected successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to disconnect platform");
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availablePlatforms.map((platform) => {
                const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
                if (!config) return null;
                const connection = connections.find(c => c.platform === platform);
                const Icon = config.icon;

                return (
                    <Card key={platform}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Icon className={config.color} />
                                {config.name}
                            </CardTitle>
                            <CardDescription>
                                {connection ? (
                                    <span className="text-green-600">
                                        Connected as {connection.platformAccountName}
                                    </span>
                                ) : (
                                    "Not connected"
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {connection ? (
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDisconnect(connection.id)}
                                >
                                    Disconnect
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleConnect(platform)}
                                >
                                    Connect {config.name}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}