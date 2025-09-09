
"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { StatCards } from '@/components/dashboard/StatCards';
import { AssignDelivery } from '@/components/dashboard/AssignDelivery';
import { DeliveriesList } from '@/components/dashboard/DeliveriesList';
import ReceiptModal from '@/components/modals/ReceiptModal';
import { Skeleton } from '../ui/skeleton';

export default function AdminDashboard({ user }: { user: any }) {
    const [deliveries, setDeliveries] = useState([]);
    const [jobFiles, setJobFiles] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);

    useEffect(() => {
        const isStaff = user.role === 'admin' || user.role === 'user';
        if (!isStaff) {
            setLoading(false);
            return;
        }

        const queries = [
            { coll: 'deliveries', stateSetter: setDeliveries, q: query(collection(db, 'deliveries'), orderBy('createdAt', 'desc')) },
            { coll: 'jobfiles', stateSetter: setJobFiles, q: query(collection(db, 'jobfiles')) },
            { coll: 'users', stateSetter: setUsers, q: query(collection(db, 'users')) },
        ];

        const unsubs = queries.map(({ coll, stateSetter, q }) => {
            return onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Safely convert timestamps
                    ...(doc.data().createdAt?.toDate && { createdAt: doc.data().createdAt.toDate().toISOString() }),
                    ...(doc.data().completedAt?.toDate && { completedAt: doc.data().completedAt.toDate().toISOString() }),
                }));
                stateSetter(data as any);
            }, (err) => {
                console.error(`Firestore Error (${coll}):`, err);
                setError(`Permission error: Could not load ${coll} data.`);
            });
        });
        
        // This is a simple way to know when initial loads are done.
        // A more robust solution might use Promise.all with getDocs for initial load.
        const initialLoadTimer = setTimeout(() => setLoading(false), 2500);

        return () => {
            unsubs.forEach(unsub => unsub());
            clearTimeout(initialLoadTimer);
        };
    }, [user.role]);

    const handleViewReceipt = (deliveryId: string) => {
        setSelectedDeliveryId(deliveryId);
        setIsReceiptModalOpen(true);
    };

    const pendingDeliveries = deliveries.filter((d: any) => d.status !== 'Delivered');
    const completedDeliveries = deliveries.filter((d: any) => d.status === 'Delivered');
    const activeDrivers = users.filter((u: any) => u.role === 'driver' && u.status === 'active');


    return (
        <div className="space-y-12">
            <StatCards deliveries={deliveries} />

            <AssignDelivery jobFiles={jobFiles} drivers={activeDrivers} />

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading && deliveries.length === 0 ? (
                    <>
                        <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                         <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    </>
                ) : error ? (
                    <p className="text-destructive col-span-2">{error}</p>
                ) : (
                    <>
                        <DeliveriesList title="Pending Deliveries" deliveries={pendingDeliveries} onViewReceipt={handleViewReceipt} isAdmin={user.role === 'admin'} />
                        <DeliveriesList title="Completed Deliveries" deliveries={completedDeliveries} onViewReceipt={handleViewReceipt} isAdmin={user.role === 'admin'} />
                    </>
                )}
            </section>
            
            {selectedDeliveryId && (
                 <ReceiptModal 
                    isOpen={isReceiptModalOpen}
                    onClose={() => setIsReceiptModalOpen(false)}
                    deliveryId={selectedDeliveryId}
                />
            )}
        </div>
    );
}
