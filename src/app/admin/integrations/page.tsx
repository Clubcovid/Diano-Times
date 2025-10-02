
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

function IntegrationStatusCard({ title, description, isConfigured }: { title: string, description: string, isConfigured: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <p className="font-semibold">Status</p>
                    <Badge variant={isConfigured ? "default" : "destructive"} className="gap-1.5 pl-2 pr-2.5 py-1 text-xs font-medium">
                        {isConfigured ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {isConfigured ? "Configured" : "Not Configured"}
                    </Badge>
                </div>
                {!isConfigured && (
                    <p className="text-xs text-muted-foreground mt-2">
                        One or more required API keys are missing from the environment variables.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}


export default function IntegrationsPage() {
    // Check for the presence of environment variables to determine configuration status
    const isTelegramConfigured = !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_NEWS_CHANNEL_ID && process.env.TELEGRAM_ADMIN_CHAT_ID);
    const isTwitterConfigured = !!(process.env.TWITTER_API_KEY && process.env.TWITTER_API_KEY_SECRET && process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_TOKEN_SECRET);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Integrations</h1>
                <p className="text-muted-foreground">
                    Manage your site's connections to social media platforms.
                </p>
            </div>
            
            <div className="space-y-8">
                <IntegrationStatusCard 
                    title="Telegram"
                    description="Automate notifications for new posts, new user sign-ups, and power the interactive 'Ask Diano' bot."
                    isConfigured={isTelegramConfigured}
                />
                
                <IntegrationStatusCard
                    title="Twitter / X"
                    description="Automatically tweet new articles to your followers the moment they are published."
                    isConfigured={isTwitterConfigured}
                />
            </div>
        </div>
    );
}
