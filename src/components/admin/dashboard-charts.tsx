
'use client';

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type PostCategoryData = { name: string; posts: number; fill: string; }[];
export type TrafficData = { name: string; value: number; fill: string; }[];
export type EngagementData = { name: string; published?: number; drafts?: number; }[];


interface DashboardChartsProps {
    postsData: PostCategoryData;
    trafficData: TrafficData;
    engagementData: EngagementData;
}

export function DashboardCharts({ postsData, trafficData, engagementData }: DashboardChartsProps) {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
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

                <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Traffic Sources (Mock Data)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={trafficData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label />
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Posts by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={postsData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="posts" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </>
    )
}
