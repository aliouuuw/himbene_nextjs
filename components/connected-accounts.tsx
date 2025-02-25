import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Linkedin } from "lucide-react"

// This would typically come from your database
const connectedAccounts = [
  { name: "Facebook", connected: true, icon: Facebook },
  { name: "Twitter", connected: false, icon: Twitter },
  { name: "LinkedIn", connected: true, icon: Linkedin },
]

export function ConnectedAccounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>Manage your connected social media accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connectedAccounts.map((account) => (
            <div key={account.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <account.icon className="w-6 h-6" />
                <span>{account.name}</span>
              </div>
              <Button variant={account.connected ? "outline" : "default"}>
                {account.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

