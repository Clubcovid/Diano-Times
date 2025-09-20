
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AiFeatureForm } from "./ai-feature-form";
import { getAiFeatureFlags } from "@/lib/ai-flags";


export default async function AiSettingsPage() {
    const flags = await getAiFeatureFlags();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">AI Feature Management</h1>
                <p className="text-muted-foreground">
                    Enable or disable individual AI-powered features across the site.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>AI Kill Switches</CardTitle>
                    <CardDescription>
                        Use these toggles to immediately enable or disable specific AI functionalities. This is useful for controlling costs or if a feature is not behaving as expected.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AiFeatureForm initialFlags={flags} />
                </CardContent>
            </Card>
        </div>
    )
}
