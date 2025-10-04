
'use client';

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { electionCountdownSchema, type ElectionCountdownFormData } from '@/lib/schemas';
import { updateElectionCountdownConfig } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Save, Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ElectionCountdownConfig } from '@/lib/types';

interface CountdownFormProps {
    initialConfig: Omit<ElectionCountdownConfig, 'electionDate'> & { electionDate: string };
}

export function CountdownForm({ initialConfig }: CountdownFormProps) {
    const [isSaving, startSaving] = useTransition();
    const { toast } = useToast();

    const { control, handleSubmit, formState: { errors } } = useForm<ElectionCountdownFormData>({
        resolver: zodResolver(electionCountdownSchema),
        defaultValues: {
            ...initialConfig,
            electionDate: initialConfig.electionDate ? new Date(initialConfig.electionDate) : new Date(),
        },
    });

    const onSubmit = (data: ElectionCountdownFormData) => {
        startSaving(async () => {
            const result = await updateElectionCountdownConfig(data);
            if (result.success) {
                toast({
                    title: "Settings Saved",
                    description: "Election countdown settings have been updated.",
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
                <Controller
                    name="isEnabled"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <Label htmlFor="isEnabled" className="flex flex-col space-y-1">
                                <span>Enable Countdown</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Show or hide the countdown timer on the website.
                                </span>
                            </Label>
                            <Switch
                                id="isEnabled"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isSaving}
                            />
                        </div>
                    )}
                />
                
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Controller
                        name="country"
                        control={control}
                        render={({ field }) => (
                            <Input id="country" placeholder="e.g., Kenya" {...field} />
                        )}
                    />
                    {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label>Election Date</Label>
                     <Controller
                        name="electionDate"
                        control={control}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.electionDate && <p className="text-sm text-destructive">{errors.electionDate.message}</p>}
                </div>
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
