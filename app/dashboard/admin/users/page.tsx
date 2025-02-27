import { getUsers } from '@/app/actions/admin-actions'
import UserForm from '@/app/dashboard/admin/users/UserForm'
import { requireAdmin } from '@/lib/auth'

export default async function UserManagement() {
  const users = await getUsers();
  await requireAdmin();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <UserForm />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="grid gap-4">
          {users.map((user) => (
            <div 
              key={user.id} 
              className="p-4 border rounded shadow-sm"
            >
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-gray-600">
                Role: {user.role}
              </p>
              <p className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 