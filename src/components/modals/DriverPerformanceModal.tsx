"use client";

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import FeedbackModal from './FeedbackModal';
import { ScrollArea } from '../ui/scroll-area';
import { BarChart, XAxis, YAxis, Tooltip, CartesianGrid, Bar, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--qgo-teal))",
  },
} satisfies ChartConfig

function DriverStatCard({ stat, onShowFeedback, onShowDeliveries }: { stat: any, onShowFeedback: (id: string) => void, onShowDeliveries: (id: string) => void }) {
    const starRating = '★'.repeat(Math.round(stat.averageRating)) + '☆'.repeat(5 - Math.round(stat.averageRating));

    return (
        <Card className="p-4 space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
            <div className="flex-shrink-0">
                <p className="font-bold text-lg">{stat.displayName}</p>
                <p className="text-sm text-muted-foreground">{stat.email}</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 text-center flex-grow">
                <div title={`Average Rating: ${stat.averageRating.toFixed(2)} (${stat.totalRatings} ratings)`}>
                    <p className="text-2xl font-bold text-yellow-500">{starRating}</p>
                    <p className="text-xs text-muted-foreground">Avg. Rating</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-green-600">{stat.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-yellow-600">{stat.pending}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                </div>
            </div>
            <div className="flex justify-center md:justify-end gap-2 flex-shrink-0 w-full md:w-auto">
                <Button onClick={() => onShowFeedback(stat.id)} variant="outline" size="sm">View Feedback</Button>
                <Button onClick={() => onShowDeliveries(stat.id)} variant="secondary" size="sm">View Deliveries</Button>
            </div>
        </Card>
    );
}

export default function DriverPerformanceModal({ isOpen, onClose, deliveries, users, feedback }: { isOpen: boolean, onClose: () => void, deliveries: any[], users: any[], feedback: any[] }) {
    const [selectedDriverIdForFeedback, setSelectedDriverIdForFeedback] = useState<string | null>(null);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    
    // TODO: Add view deliveries modal

    const driverStats = useMemo(() => {
        const drivers = users.filter(u => u.role === 'driver');
        return drivers.map(driver => {
            const completed = deliveries.filter(d => d.driverUid === driver.id && d.status === 'Delivered').length;
            const pending = deliveries.filter(d => d.driverUid === driver.id && d.status !== 'Delivered').length;
            
            const driverFeedback = feedback.filter(f => f.driverUid === driver.id);
            const totalRatings = driverFeedback.length;
            const averageRating = totalRatings > 0 ? (driverFeedback.reduce((sum, f) => sum + f.rating, 0) / totalRatings) : 0;

            return { ...driver, completed, pending, averageRating, totalRatings };
        }).sort((a, b) => b.completed - a.completed);
    }, [deliveries, users, feedback]);
    
    const selectedDriverFeedback = feedback.filter(f => f.driverUid === selectedDriverIdForFeedback);
    const selectedDriver = users.find(u => u.id === selectedDriverIdForFeedback);

    const handleShowFeedback = (driverId: string) => {
        setSelectedDriverIdForFeedback(driverId);
        setIsFeedbackModalOpen(true);
    }
    
    // This is a placeholder for when the "View Deliveries" modal is built
    const handleShowDeliveries = (driverId: string) => {
        alert(`Showing deliveries for driver ID: ${driverId}. (Modal not yet implemented)`);
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Driver Performance Dashboard</DialogTitle>
                        <DialogDescription>Overview of all driver statistics and performance.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <Card className="p-4">
                            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                <ResponsiveContainer>
                                    <BarChart accessibilityLayer data={driverStats}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="displayName" tickLine={false} tickMargin={10} axisLine={false} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </Card>
                        <ScrollArea className="h-[40vh]">
                            <div className='pr-4 space-y-3'>
                                {driverStats.map(stat => (
                                    <DriverStatCard key={stat.id} stat={stat} onShowFeedback={handleShowFeedback} onShowDeliveries={handleShowDeliveries} />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {selectedDriver && (
                 <FeedbackModal
                    isOpen={isFeedbackModalOpen}
                    onClose={() => setIsFeedbackModalOpen(false)}
                    feedbackList={selectedDriverFeedback}
                    deliveries={deliveries}
                    title={`Feedback for ${selectedDriver.displayName}`}
                />
            )}
        </>
    );
}
