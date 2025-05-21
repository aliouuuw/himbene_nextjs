import { getUsers } from '@/app/actions/admin-actions'
import UserForm from '@/app/dashboard/admin/_components/UserForm'
import UserList from '@/app/dashboard/admin/_components/UserList'
import { isAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation';

export default async function UserManagement() {
  const users = await getUsers();
  try {
    await isAdmin();
  } catch (error) {
    console.error("User is not admin:", error);
    redirect("/");
  }
  
  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Créer un utilisateur</h2>
        <UserForm />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
        <UserList users={users} />
      </div>
    </div>
  );
} 