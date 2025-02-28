import { getUsers } from '@/app/actions/admin-actions'
import UserForm from '@/app/dashboard/admin/_components/UserForm'
import { requireAdmin } from '@/lib/auth'

export default async function UserManagement() {
  const users = await getUsers();
  await requireAdmin();
  
  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Create User</h2>
        <UserForm />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="p-4 rounded-lg border">
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                Role: {user.role}
              </p>
              <p className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 