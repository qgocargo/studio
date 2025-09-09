import MainApp from '@/components/dashboard/MainApp';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  // initialData is now an empty object, client components will fetch their own data
  const initialData = { deliveries: [], feedback: [], jobFiles: [], users: [] };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <MainApp user={session.user} initialData={initialData} />
    </div>
  );
}

    