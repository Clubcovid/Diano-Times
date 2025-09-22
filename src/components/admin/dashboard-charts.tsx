
'use client';

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type PostCategoryData = { name: string; value: number; fill: string; }[];
export type EngagementData = { name: string; published?: number; drafts?: number; }[];


interface DashboardChartsProps {
    postsData: PostCategoryData;
    engagementData: EngagementData;
}

export function DashboardCharts({ postsData, engagementData }: DashboardChartsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle>Content Creation Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="published" name="Published" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="drafts" name="Drafts" stroke="hsl(var(--secondary-foreground))" />
                </LineChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>Posts by Category</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={postsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>
        </div>
    )
}
