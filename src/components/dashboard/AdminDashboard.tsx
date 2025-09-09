"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { StatCards } from '@/components/dashboard/StatCards';
import { AssignDelivery } from '@/components/dashboard/AssignDelivery';
import { DeliveriesList } from '@/components/dashboard/DeliveriesList';
import ReceiptModal from '@/components/modals/ReceiptModal';
import { Skeleton } from '../ui/skeleton';

export default function AdminDashboard({ user, initialData }: { user: any, initialData: any }) {
    const [deliveries, setDeliveries] = useState(initialData.deliveries || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'deliveries'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const freshDeliveries = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate().toISOString(),
                    completedAt: data.completedAt?.toDate().toISOString(),
                };
            });
            setDeliveries(freshDeliveries);
            setLoading(false);
        }, (err) => {
            console.error("Firestore Error (Deliveries):", err);
            setError("Permission error: Could not load delivery data.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleViewReceipt = (deliveryId: string) => {
        setSelectedDeliveryId(deliveryId);
        setIsReceiptModalOpen(true);
    };

    const pendingDeliveries = deliveries.filter((d: any) => d.status !== 'Delivered');
    const completedDeliveries = deliveries.filter((d: any) => d.status === 'Delivered');

    return (
        <div className="space-y-12">
            <StatCards deliveries={deliveries} />

            <AssignDelivery jobFiles={initialData.jobFiles || []} drivers={initialData.users?.filter((u:any) => u.role === 'driver' && u.status === 'active') || []} />

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
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
