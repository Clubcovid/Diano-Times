import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
          <CardTitle>Site Configuration</CardTitle>
          <CardDescription>
            These settings are under development and will be enabled in a future update.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                    <Label htmlFor="maintenance-mode" className="font-semibold">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                        Temporarily take your site offline for visitors.
                    </p>
                </div>
                <Switch id="maintenance-mode" disabled />
            </div>
             <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                    <Label htmlFor="theme-settings" className="font-semibold">Theme Customization</Label>
                    <p className="text-sm text-muted-foreground">
                        Change fonts, colors, and other visual styles.
                    </p>
                </div>
                 <p className="text-sm font-medium text-muted-foreground pr-2">Coming Soon</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
