import { AuthProviderInterface, User } from "../../shared/types";
import { hash, compare } from "../../shared/utils/bcrypt";

// In-memory user store for development
const users: User[] = [
  {
    id: "1",
    email: "admin@fohsen.org",
    name: "Admin User",
    role: "admin",
    // This is the hashed version of "adminpass"
    hashedPassword: "$2b$10$tqKK7JjSDhSTdQpIG0oVBOGLd.FxZjaOEV8oPZJVx81xnGcSkW9xa"
  },
  {
    id: "2",
    email: "user@fohsen.org",
    name: "Regular User",
    role: "user",
    // This is the hashed version of "userpass"
    hashedPassword: "$2b$10$ISRu6U93PBhI6W5de4erRuzJx.x/s/pH7OAM2sFRMufTf7DxEBkja"
  }
];

export const memoryAuthProvider: AuthProviderInterface = {
  getUserByEmail: async (email: string) => {
    try {
      const user = users.find(u => u.email === email);
      if (!user) return null;
      // Return user without the password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error("Error getting user by email", { cause: error });
    }
  },
  
  validatePassword: async (user: User, password: string) => {
    try {
      const fullUser = users.find(u => u.id === user.id);
      if (!fullUser || !fullUser.hashedPassword) return false;
      
      return compare(password, fullUser.hashedPassword);
    } catch (error) {
      throw new Error("Error validating password", { cause: error });
    }
  },
  
  createUser: async (email: string, password: string, name?: string) => {
    try {
      const hashedPassword = await hash(password, 10);
      const newUser: User & { hashedPassword: string } = {
        id: String(users.length + 1),
        email,
        name: name || email.split('@')[0],
        role: "user",
        hashedPassword
      };
    
      users.push(newUser);

      // Return user without the password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashedPassword: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw new Error("Error creating user", { cause: error });
    }
  }
}; 