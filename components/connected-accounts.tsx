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
        <div className="grid gap-3">
          {connectedAccounts.map((account) => (
            <div 
              key={account.name} 
              className="flex flex-wrap items-center justify-between p-3 border rounded-lg space-y-2 sm:space-y-0"
            >
              <div className="flex items-center space-x-3 min-w-[140px]">
                <account.icon className="w-5 h-5" />
                <span className="text-sm">{account.name}</span>
              </div>
              <Button 
                variant={account.connected ? "outline" : "default"}
                className="w-full sm:w-auto"
              >
                {account.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

