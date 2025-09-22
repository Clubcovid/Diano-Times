
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getPosts } from '@/lib/posts';
import { getUsers } from '@/lib/actions.tsx';
import { DashboardCharts, type PostCategoryData, type EngagementData, type TrafficData } from '@/components/admin/dashboard-charts';
import type { Post } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Users, CheckCircle, Edit, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, subMonths, getMonth, getYear } from 'date-fns';

const trafficData: TrafficData = [
  { name: 'Direct', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Organic', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Referral', value: 200, fill: 'hsl(var(--chart-3))' },
  { name: 'Social', value: 278, fill: 'hsl(var(--chart-4))' },
];

function getEngagementData(posts: Post[]): EngagementData {
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), i);
        return { year: getYear(d), month: getMonth(d), name: format(d, 'MMM'), published: 0, drafts: 0 };
    }).reverse();

    posts.forEach(post => {
        const postDate = post.createdAt.toDate();
        const postYear = getYear(postDate);
        const postMonth = getMonth(postDate);

        const monthData = last6Months.find(m => m.year === postYear && m.month === postMonth);

        if (monthData) {
            if (post.status === 'published') {
                monthData.published += 1;
            } else {
                monthData.drafts += 1;
            }
        }
    });

    return last6Months.map(({ name, published, drafts }) => ({ name, published, drafts }));
}


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

function RecentPosts({ posts }: { posts: Post[] }) {
    if (posts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Posts Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">There are no posts to display.</p>
                </CardContent>
            </Card>
        )
    }
    return (
        <div className="space-y-4">
            {posts.map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-muted-foreground">
                            {format(post.createdAt.toDate(), 'PPP')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/edit/${post.id}`}>Edit</Link>
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default async function DashboardPage() {
  const posts = await getPosts();
  const users = await getUsers();
  
  const publishedPosts = posts.filter(p => p.status === 'published');
  const draftPosts = posts.filter(p => p.status === 'draft');
  const recentPublished = publishedPosts.slice(0, 5);
  const recentDrafts = draftPosts.slice(0,5);

  const postsData = await getCategoryData(publishedPosts);
  const engagementData = getEngagementData(posts);

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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
            <p className="text-xs text-muted-foreground">All posts in the database.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Post Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPosts.length} Published</div>
            <p className="text-xs text-muted-foreground">{draftPosts.length} Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
             <p className="text-xs text-muted-foreground">Total registered users.</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Published Posts</CardTitle>
              <CardDescription>Your latest five articles that are live.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentPosts posts={recentPublished} />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Drafts Awaiting Review</CardTitle>
              <CardDescription>Your latest five drafts.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentPosts posts={recentDrafts} />
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
