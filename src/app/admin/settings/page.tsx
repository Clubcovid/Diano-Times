
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DatabaseZap, Bot } from 'lucide-react';


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
          <CardTitle>Site Tools</CardTitle>
          <CardDescription>
            Advanced tools for managing your site data and AI features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <p className="font-semibold">AI Feature Management</p>
                    <p className="text-sm text-muted-foreground">
                        Enable or disable individual AI-powered features.
                    </p>
                </div>
                 <Button asChild>
                    <Link href="/admin/settings/ai">
                        <Bot className="mr-2 h-4 w-4" />
                        Manage AI Features
                    </Link>
                </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <p className="font-semibold">Seed Database</p>
                    <p className="text-sm text-muted-foreground">
                        Populate your database with initial mock data.
                    </p>
                </div>
                 <Button asChild>
                    <Link href="/admin/settings/seed">
                        <DatabaseZap className="mr-2 h-4 w-4" />
                        Go to Seeder
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
