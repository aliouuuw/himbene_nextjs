// Send email to user with temporary password using brevo

export async function sendTemporaryPasswordEmail(email: string, tempPassword: string) {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
            "accept": "application/json",
            "api-key": process.env.BREVO_API_KEY as string,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            sender: {
                name: "Himbene Admin",
                email: "wadealiou00@gmail.com"
            },
            to: [{
                email: email,
                name: "John Doe"
            }],
            subject: "Bienvenue sur le site de Himbene",
            htmlContent: `<html><head></head><body><p>Hello,</p>Here is your temporary password: ${tempPassword}</p></body></html>`
        })
    });
    return response.json();
    } catch (error) {
        console.error("Error sending email:", error);
        return { error: "Error sending email" };
    }
}

export async function sendPasswordResetEmail(email: string, url: string) {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY as string,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: {
                    name: "Himbene Admin",
                    email: "wadealiou00@gmail.com"
                },
                to: [{
                    email: email,
                    name: "User"
                }],
                subject: "Réinitialisation de votre mot de passe Himbene",
                htmlContent: `
                    <html>
                        <head></head>
                        <body>
                            <p>Bonjour,</p>
                            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                            <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                            <p><a href="${url}">Réinitialiser mon mot de passe</a></p>
                            <p>Ce lien expirera dans 1 heure.</p>
                            <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
                        </body>
                    </html>`
            })
        });
        return response.json();
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return { error: "Error sending password reset email" };
    }
}
