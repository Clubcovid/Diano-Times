
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CountdownForm } from "./countdown-form";
import { getElectionCountdownConfig } from "@/lib/actions";
import type { ElectionCountdownConfig } from "@/lib/types";

export default async function CountdownPage() {
    const config = await getElectionCountdownConfig();
    
    const serializableConfig: ElectionCountdownConfig = {
        ...config,
        electionDate: config.electionDate ? config.electionDate.toDate().toISOString() : new Date().toISOString(),
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Election Countdown</h1>
                <p className="text-muted-foreground">
                    Manage the election countdown timer displayed on the website.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Countdown Settings</CardTitle>
                    <CardDescription>
                        Enable or disable the timer, set the election date, and specify the country.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CountdownForm initialConfig={serializableConfig} />
                </CardContent>
            </Card>
        </div>
    )
}
