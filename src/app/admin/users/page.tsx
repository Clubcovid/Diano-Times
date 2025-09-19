import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Users</h1>
        <p className="text-muted-foreground">
          Manage your site's users. This feature is coming soon.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>A table of registered users, their online status, and last seen time will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
