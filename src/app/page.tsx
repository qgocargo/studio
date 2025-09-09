import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import PublicPodView from '@/components/public/PublicPodView'
import PublicFeedbackView from '@/components/public/PublicFeedbackView'
import MainApp from '@/components/dashboard/MainApp'

async function getFirestoreData(user: any) {
  if (!user || !user.uid) {
    return { deliveries: [], feedback: [], jobFiles: [], users: [] };
  }

  if (user.role === 'driver') {
    const deliveriesQuery = query(collection(db, "deliveries"), where("driverUid", "==", user.uid), orderBy("createdAt", "desc"));
    const feedbackQuery = query(collection(db, "feedback"), where("driverUid", "==", user.uid));

    const [deliveriesSnapshot, feedbackSnapshot] = await Promise.all([
      getDocs(deliveriesQuery),
      getDocs(feedbackQuery)
    ]);
    
    const deliveries = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate().toISOString() }));
    const feedback = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate().toISOString() }));
    
    return { deliveries, feedback };
  } else {
    // Admin or Staff
    const deliveriesQuery = query(collection(db, 'deliveries'), orderBy("createdAt", "desc"));
    const jobFilesPromise = getDocs(collection(db, 'jobfiles'));
    const usersPromise = getDocs(collection(db, 'users'));
    const feedbackPromise = getDocs(collection(db, 'feedback'));

    const [deliveriesSnapshot, jobFilesSnapshot, usersSnapshot, feedbackSnapshot] = await Promise.all([
      getDocs(deliveriesQuery),
      jobFilesPromise,
      usersPromise,
      feedbackPromise,
    ]);

    const deliveries = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate().toISOString(), completedAt: doc.data().completedAt?.toDate().toISOString() }));
    const jobFiles = jobFilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const feedback = feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate().toISOString() }));

    return { deliveries, jobFiles, users, feedback };
  }
}

export default async function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const { podId, feedbackId } = searchParams;

  if (typeof podId === 'string' && podId) {
    const podDocRef = doc(db, 'pods', podId);
    const podSnap = await getDoc(podDocRef);
    if (podSnap.exists()) {
      const podData = { ...podSnap.data(), completedAt: podSnap.data().completedAt.toDate().toISOString() };
      return <PublicPodView pod={podData} />;
    } else {
      return <div className="p-4 text-center text-red-700 bg-red-100">POD not found.</div>;
    }
  }

  if (typeof feedbackId === 'string' && feedbackId) {
    return <PublicFeedbackView feedbackId={feedbackId} />;
  }

  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const initialData = await getFirestoreData(session.user);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <MainApp user={session.user} initialData={initialData} />
    </div>
  );
}
