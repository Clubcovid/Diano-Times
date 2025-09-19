import { UsersTable } from '@/components/admin/users-table';
import { getUsers } from '@/lib/actions';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Users</h1>
        <p className="text-muted-foreground">
          View and manage all registered users on your site.
        </p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
