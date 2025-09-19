import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdvertisementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Advertisements</h1>
        <p className="text-muted-foreground">
          Manage your site's advertisements. This feature is coming soon.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The ability to add and manage advertisements will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
