"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent } from "../ui/card";

export default function FeedbackModal({ isOpen, onClose, feedbackList, deliveries, title }: { isOpen: boolean, onClose: () => void, feedbackList: any[], deliveries: any[], title: string }) {
    const sortedFeedback = [...feedbackList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>A list of all ratings and comments received.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-3 pr-4">
                        {sortedFeedback.length > 0 ? (
                            sortedFeedback.map(feedback => {
                                const delivery = deliveries.find(d => d.id === feedback.deliveryId);
                                const jobFileNo = delivery?.jobFileData?.jfn || 'N/A';
                                const starRating = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);

                                return (
                                    <Card key={feedback.id}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-xl text-yellow-500">{starRating}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">For Job: <strong>{jobFileNo}</strong></p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{new Date(feedback.createdAt).toLocaleString()}</p>
                                            </div>
                                            <p className="mt-2 text-foreground">{feedback.comment || <span className="italic">No comment left.</span>}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <p className="text-muted-foreground text-center p-8">No feedback received yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
