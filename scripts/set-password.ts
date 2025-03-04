import { auth } from "../lib/auth";
import prismaClient from "../lib/prisma-client";

async function setPassword() {
  const email = "wadealiou00@gmail.com"; // Replace with your admin email
  const password = "wadealiou00"; // Replace with desired password
  
  try {
    const user = await prismaClient.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error("User not found");
      return;
    }

    // Create a credential account for the user
    await prismaClient.account.create({
      data: {
        id: `credential_${user.id}`,
        accountId: email,
        providerId: "credentials",
        userId: user.id,
        password: password, // Note: Better Auth will hash this
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log("Credential account created successfully!");
    
    // Now try to authenticate with the new credentials
    await auth.api.signInEmail({
      body: {
        email: email,
        password: password
      }
    });

    console.log("Authentication successful!");
  } catch (error) {
    console.error("Error setting up authentication:", error);
  }
}

setPassword(); 