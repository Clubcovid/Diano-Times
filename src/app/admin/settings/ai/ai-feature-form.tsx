
'use client';

import { useTransition } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { AiFeatureFlags } from "@/lib/ai-flags";
import { updateAiFeatureFlags } from "@/lib/actions";
import { Save, Loader2 } from "lucide-react";
import { useForm, Controller } from 'react-hook-form';

interface AiFeatureFormProps {
    initialFlags: AiFeatureFlags;
}

const AI_FEATURES: Record<keyof AiFeatureFlags, string> = {
  isUrlSlugGenerationEnabled: 'URL Slug Generation',
  isWeatherForecastEnabled: 'Weather Ticker',
  isPostGenerationEnabled: 'AI Post Generation (Manual & Auto-Pilot)',
  isTopicSuggestionEnabled: 'Auto-Pilot Topic Suggestion',
  isMagazineGenerationEnabled: 'Weekly Magazine Generation',
  isCoverImageGenerationEnabled: 'AI Cover Image Generation',
  isAskDianoEnabled: 'Ask Diano Q&A',
};

export function AiFeatureForm({ initialFlags }: AiFeatureFormProps) {
    const [isSaving, startSaving] = useTransition();
    const { toast } = useToast();
    
    const { control, handleSubmit } = useForm<AiFeatureFlags>({
        defaultValues: initialFlags,
    });

    const onSubmit = (data: AiFeatureFlags) => {
        startSaving(async () => {
            const result = await updateAiFeatureFlags(data);
            if (result.success) {
                toast({
                    title: "Settings Saved",
                    description: "AI feature flags have been updated.",
                });
            } else {
                toast({
                    title: "Error",
                    description: result.message || "Failed to save settings.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
                {(Object.keys(AI_FEATURES) as Array<keyof AiFeatureFlags>).map((key) => (
                    <Controller
                        key={key}
                        name={key}
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <Label htmlFor={key} className="flex flex-col space-y-1">
                                    <span>{AI_FEATURES[key]}</span>
                                    <span className="font-normal leading-snug text-muted-foreground">
                                        Toggle this feature on or off globally.
                                    </span>
                                </Label>
                                <Switch
                                    id={key}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isSaving}
                                />
                            </div>
                        )}
                    />
                ))}
            </div>
            
            <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                    </>
                )}
            </Button>
        </form>
    );
}
