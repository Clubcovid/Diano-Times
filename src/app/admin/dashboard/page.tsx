
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPosts } from '@/lib/posts';
import { getUsers } from '@/lib/actions';
import { DashboardCharts, type PostCategoryData, type EngagementData, type TrafficData } from '@/components/admin/dashboard-charts';
import type { Post } from '@/lib/types';

const trafficData: TrafficData = [
  { name: 'Direct', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Organic', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Referral', value: 200, fill: 'hsl(var(--chart-3))' },
  { name: 'Social', value: 278, fill: 'hsl(var(--chart-4))' },
];

const engagementData: EngagementData = [
  { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
];

async function getCategoryData(posts: Post[]): Promise<PostCategoryData> {
    const categoryCounts = posts.reduce((acc, post) => {
        post.tags.forEach(tag => {
            if (acc[tag]) {
                acc[tag]++;
            } else {
                acc[tag] = 1;
            }
        });
        return acc;
    }, {} as Record<string, number>);

    const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    return Object.entries(categoryCounts).map(([name, count], index) => ({
        name,
        posts: count,
        fill: chartColors[index % chartColors.length]
    }));
}


export default async function DashboardPage() {
  const posts = await getPosts();
  const users = await getUsers();
  const postsData = await getCategoryData(posts);

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
            <p className="text-muted-foreground">
                An overview of your site's performance.
            </p>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{posts.length}</div>
            <p className="text-xs text-muted-foreground">All posts in the database.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{users.length}</div>
             <p className="text-xs text-muted-foreground">Total registered users.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">250,000</div>
             <p className="text-xs text-muted-foreground">(Mock Data) +12% since last month</p>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts
        postsData={postsData}
        engagementData={engagementData}
        trafficData={trafficData}
      />
    </div>
  );
}
