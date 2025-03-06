import { auth } from "@/lib/auth";

async function signupNewUser() {
    const email = "wadealiou00@gmail.com";
    const password = "*********";

    await auth.api.signUpEmail({
        body: {
            name: "Wade Aliou",
            email,
            password,
            role: "ADMIN"
        }
    });
}

signupNewUser();