import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';


export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your site's appearance and behavior.
        </p>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
                <p className="font-semibold">Theme</p>
                <p className="text-sm text-muted-foreground">
                    Select the theme for the website.
                </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Site Configuration</CardTitle>
          <CardDescription>
            These settings are under development and will be enabled in a future update.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                    <p className="font-semibold text-muted-foreground/80">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground/80">
                        Temporarily take your site offline for visitors.
                    </p>
                </div>
                 <p className="text-sm font-medium text-muted-foreground/80 pr-2">Coming Soon</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
