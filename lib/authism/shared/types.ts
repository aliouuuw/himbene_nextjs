import { z } from "zod";

// Define user types with Zod for validation
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["user", "admin"]).default("user"),
  hashedPassword: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Auth provider interface - this will be implemented with different databases
export interface AuthProviderInterface {
  getUserByEmail: (email: string) => Promise<User | null>;
  validatePassword: (user: User, password: string) => Promise<boolean>;
  createUser?: (email: string, password: string, name?: string) => Promise<User>;
}

// Session type
export interface Session {
  user: User;
  expires: Date;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: User;
}

export interface AuthResult {
  success: boolean;
  error?: string;
} 