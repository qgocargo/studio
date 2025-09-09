
import MainApp from '@/components/dashboard/MainApp'

export default function Home() {
  
  // Hardcoded user to bypass login and permission issues
  const mockUser = {
    uid: '02VoCEXFm9QfSxs3TCRaLdG5A4q1', // Example Driver UID
    displayName: 'Test Driver',
    role: 'driver',
    email: 'driver@example.com',
    status: 'active'
  };

  // initialData is now an empty object, client components will fetch their own data
  const initialData = { deliveries: [], feedback: [], jobFiles: [], users: [] };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <MainApp user={mockUser} initialData={initialData} />
    </div>
  );
}
