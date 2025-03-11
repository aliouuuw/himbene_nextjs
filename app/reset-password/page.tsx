"use client";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
                <p className="text-sm text-gray-500">This password reset link is invalid or has expired.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-gray-500">Enter your new password</p>
            <Card>
                <CardContent className="flex flex-col gap-4 p-4">
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const newPassword = (e.target as HTMLFormElement).newPassword.value;
                            await authClient.resetPassword({
                                token,
                                newPassword: newPassword as string,
                            });
                            toast.success("Password reset successfully");
                            // Redirect to sign in page
                            window.location.href = "/sign-in";
                        } catch (error) {
                            toast.error("Failed to reset password");
                            console.error(error);
                        }
                    }} className="flex flex-col gap-4">
                        <Input 
                            type="password" 
                            name="newPassword" 
                            placeholder="New Password" 
                            required
                            minLength={8}
                        />
                        <Button type="submit">Reset Password</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}