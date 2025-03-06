// Send email to user with temporary password using brevo

/* Template: Curl

curl --request POST \
  --url https://api.brevo.com/v3/smtp/email \
  --header 'accept: application/json' \
  --header 'api-key:YOUR_API_KEY' \
  --header 'content-type: application/json' \
  --data '{  
   "sender":{  
      "name":"Sender Alex",
      "email":"senderalex@example.com"
   },
   "to":[  
      {  
         "email":"testmail@example.com",
         "name":"John Doe"
      }
   ],
   "subject":"Hello world",
   "htmlContent":"<html><head></head><body><p>Hello,</p>This is my first transactional email sent from Brevo.</p></body></html>"
}'

*/


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
