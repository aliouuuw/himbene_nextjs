import { ConnectedAccounts } from "@/components/connected-accounts"
import { CreatePostForm } from "@/components/create-post-form"
import { ScheduledPosts } from "@/components/scheduled-posts"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <ConnectedAccounts />
      <CreatePostForm />
      <ScheduledPosts />
    </div>
  )
}

