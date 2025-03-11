"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { storeToken } from "../sign-action";

interface SignInFormClientProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
}

export function SignInFormClient({
  className,
  ...props
}: SignInFormClientProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logginMessage, setLogginMessage] = useState("");
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authClient.signIn.email(
        {
          email: email,
          password: password,
        },
        {
          onSuccess: async (ctx) => {
            const authToken = ctx.response.headers.get("set-auth-token");
            if (!authToken) return;
            console.log("client authToken", authToken);

            // Store the token in a cookie instead of localStorage
            const result = await storeToken(authToken);
            if (result.success) {
              setLogginMessage("Login successful");
              window.location.href = "/dashboard";
            } else {
              setError("Failed to store token");
              return;
            }
          },
        }
      );

      if (response.error) {
        setError(response.error.message || "Failed to sign in");
        return;
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour vous connecter à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {logginMessage && (
                <div className="text-green-500 text-sm">{logginMessage}</div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion en cours..." : "Connexion"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
