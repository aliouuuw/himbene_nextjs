import { auth } from "@/lib/auth";

async function testAuthentication() {
    const email = "wadealiou00@gmail.com";
    const password = "*********";
    try {
        await auth.api.signInEmail({
            body: {
                email,
                password
            }
        });

        console.log("Authentication successful!");
    } catch (error) {
        console.error("Authentication failed:", error);
    }
}

testAuthentication();