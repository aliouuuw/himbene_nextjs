import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Link 
          href="/dashboard/admin/users" 
          className="p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <h2 className="font-semibold mb-2">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </Link>
        <Link 
          href="/dashboard/admin/posts" 
          className="p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <h2 className="font-semibold mb-2">Posts</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage social media posts
          </p>
        </Link>
        <Link 
          href="/dashboard/admin/platforms" 
          className="p-4 border rounded-lg hover:bg-accent transition-colors"
        >
          <h2 className="font-semibold mb-2">Connected Platforms</h2>
          <p className="text-sm text-muted-foreground">
            Manage social media connections
          </p>
        </Link>
      </div>
    </div>
  );
}
