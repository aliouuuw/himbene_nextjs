"use client";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export default function ForgotPasswordPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="text-sm text-gray-500">Enter your email to reset your password</p>
            <Card>
                <CardContent className="flex flex-col gap-4 p-4">
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const email = (e.target as HTMLFormElement).email.value;
                        await authClient.forgetPassword({
                            email: email as string,
                            redirectTo: `/reset-password`,
                        }); 
                        toast.success("Email sent");
                    }} className="flex flex-col gap-4 p-4">
                        <Input type="email" name="email" placeholder="Email" />
                        <Button type="submit">Send Reset Password Email</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}