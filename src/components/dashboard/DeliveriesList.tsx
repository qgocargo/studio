"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Trash2 } from "lucide-react";
import { cancelPod } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function DeliveryCard({ delivery, onViewReceipt, isAdmin }: { delivery: any, onViewReceipt: (id: string) => void, isAdmin: boolean }) {
    const { toast } = useToast();
    const jobData = delivery.jobFileData || {};

    const handleCancelPod = async () => {
        const result = await cancelPod(delivery.id);
        if (result.success) {
            toast({ title: "Success", description: result.message });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    };

    return (
        <div className="border p-3 rounded-lg bg-gray-50 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold">{jobData.jfn || 'Unknown Job'}</p>
                    <p className="text-sm text-gray-700">{jobData.sh || 'N/A'} to {jobData.co || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Assigned to: <strong>{delivery.driverName || 'N/A'}</strong></p>
                </div>
                <Badge variant={delivery.status === 'Delivered' ? 'default' : 'secondary'} className={delivery.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {delivery.status}
                </Badge>
            </div>
            {delivery.status === 'Delivered' && (
                <div className="mt-2 pt-2 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="text-xs">
                        <p><strong>Receiver:</strong> {delivery.receiverName || 'N/A'}</p>
                        <p><strong>Completed:</strong> {delivery.completedAt ? new Date(delivery.completedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="secondary" size="sm" onClick={() => onViewReceipt(delivery.id)}>View Receipt</Button>
                        {isAdmin && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will cancel the POD for job file "{jobData.jfn}", delete the receipt, and set the delivery back to "Pending". This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCancelPod} className="bg-destructive hover:bg-destructive/90">Confirm Cancellation</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


export function DeliveriesList({ title, deliveries, onViewReceipt, isAdmin }: { title: string, deliveries: any[], onViewReceipt: (id: string) => void, isAdmin: boolean }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredDeliveries = deliveries.filter(delivery => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const job = delivery.jobFileData || {};
        return (
            (job.jfn && job.jfn.toLowerCase().includes(term)) ||
            (job.sh && job.sh.toLowerCase().includes(term)) ||
            (job.co && job.co.toLowerCase().includes(term)) ||
            (delivery.driverName && delivery.driverName.toLowerCase().includes(term)) ||
            (delivery.receiverName && delivery.receiverName.toLowerCase().includes(term))
        );
    });

    const isPending = title.includes("Pending");

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    {isPending ? <Clock className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                    <span>{title}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Input
                    type="text"
                    placeholder={`Search ${isPending ? 'pending' : 'completed'} deliveries...`}
                    className="mb-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {filteredDeliveries.length > 0 ? (
                        filteredDeliveries.map(delivery => (
                            <DeliveryCard key={delivery.id} delivery={delivery} onViewReceipt={onViewReceipt} isAdmin={isAdmin} />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No {isPending ? 'pending' : 'completed'} deliveries found.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
