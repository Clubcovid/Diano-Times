import { redirect } from 'next/navigation';

export default function AdminRootPage() {
    // Redirect from the root /admin to the new /admin/dashboard
    redirect('/admin/dashboard');
}
