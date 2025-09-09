"use client";

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import DriverPerformanceSummary from './DriverPerformanceSummary';
import DriverTasks from './DriverTasks';
import DeliveryCompletionModal from '../modals/DeliveryCompletionModal';
import ReceiptModal from '../modals/ReceiptModal';
import FeedbackModal from '../modals/FeedbackModal';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';

export default function DriverDashboard({ user, initialDeliveries, initialFeedback }: { user: any, initialDeliveries: any[], initialFeedback: any[] }) {
    const [deliveries, setDeliveries] = useState(initialDeliveries);
    const [feedback, setFeedback] = useState(initialFeedback);
    const [loading, setLoading] = useState(!initialDeliveries.length);

    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);

    useEffect(() => {
        if (!user?.uid) return;

        setLoading(true);
        const deliveriesQuery = query(collection(db, "deliveries"), where("driverUid", "==", user.uid), orderBy("createdAt", "desc"));
        const feedbackQuery = query(collection(db, "feedback"), where("driverUid", "==", user.uid));

        const unsubDeliveries = onSnapshot(deliveriesQuery, (snapshot) => {
            const freshDeliveries = snapshot.docs.map(doc => {
                const data = doc.data();
                return { 
                    id: doc.id, 
                    ...data,
                    createdAt: data.createdAt?.toDate().toISOString() 
                };
            });
            setDeliveries(freshDeliveries);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching deliveries:", error);
            setLoading(false);
        });

        const unsubFeedback = onSnapshot(feedbackQuery, (snapshot) => {
            const freshFeedback = snapshot.docs.map(doc => {
                 const data = doc.data();
                return { 
                    id: doc.id,
                    ...data, 
                    createdAt: data.createdAt?.toDate().toISOString()
                };
            });
            setFeedback(freshFeedback);
        });

        return () => {
            unsubDeliveries();
            unsubFeedback();
        };
    }, [user.uid]);

    const handleCompleteDelivery = (delivery: any) => {
        setSelectedDelivery(delivery);
        setIsCompletionModalOpen(true);
    };

    const handleViewReceipt = (delivery: any) => {
        setSelectedDelivery(delivery);
        setIsReceiptModalOpen(true);
    };

    const handleViewFeedback = () => {
        setIsFeedbackModalOpen(true);
    };
    
    return (
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">My Dashboard</h2>
                <Button onClick={handleViewFeedback} className="text-sm mt-3 sm:mt-0">My Feedback & Ratings</Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
            ) : (
                <DriverPerformanceSummary deliveries={deliveries} feedback={feedback} />
            )}

            <DriverTasks
                tasks={deliveries}
                onComplete={handleCompleteDelivery}
                onViewReceipt={handleViewReceipt}
                loading={loading}
            />

            {isCompletionModalOpen && selectedDelivery && (
                <DeliveryCompletionModal
                    isOpen={isCompletionModalOpen}
                    onClose={() => setIsCompletionModalOpen(false)}
                    delivery={selectedDelivery}
                />
            )}
            
            {isReceiptModalOpen && selectedDelivery && (
                <ReceiptModal
                    isOpen={isReceiptModalOpen}
                    onClose={() => setIsReceiptModalOpen(false)}
                    deliveryId={selectedDelivery.id}
                />
            )}
            
            {isFeedbackModalOpen && (
                <FeedbackModal
                    isOpen={isFeedbackModalOpen}
                    onClose={() => setIsFeedbackModalOpen(false)}
                    feedbackList={feedback}
                    deliveries={deliveries}
                    title="My Feedback"
                />
            )}
        </section>
    );
}
