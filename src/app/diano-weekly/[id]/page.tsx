import { redirect } from 'next/navigation';

export default function DianoWeeklyIdPage({ params }: { params: { id: string } }) {
    redirect(`/magazine/${params.id}`);
}
