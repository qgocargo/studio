"use client";

import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

function DriverTaskCard({ task, onComplete, onViewReceipt }: { task: any, onComplete: (task: any) => void, onViewReceipt: (task: any) => void }) {
    const jobData = task.jobFileData || {};

    return (
        <div className={`border p-4 rounded-lg shadow-sm transition-all hover:shadow-md ${task.status === 'Pending' ? 'bg-white' : 'bg-gray-100'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-3 sm:mb-0">
                    <p className="font-bold text-lg">{jobData.jfn}</p>
                    <p className="text-sm text-gray-700"><strong>To:</strong> {task.deliveryLocation}</p>
                    <p className="text-xs text-gray-500"><strong>Assigned:</strong> {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    <Badge variant={task.status === 'Delivered' ? 'default' : 'secondary'} className={task.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {task.status}
                    </Badge>
                     {task.status === 'Pending' ? (
                        <Button onClick={() => onComplete(task)} size="sm">Complete Delivery</Button>
                    ) : (
                        <Button onClick={() => onViewReceipt(task)} variant="secondary" size="sm">View Receipt</Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function DriverTasks({ tasks, onComplete, onViewReceipt, loading }: { tasks: any[], onComplete: (task: any) => void, onViewReceipt: (task: any) => void, loading: boolean }) {
    
    const sortedTasks = [...tasks].sort((a,b) => {
        if (a.status === 'Pending' && b.status !== 'Pending') return -1;
        if (a.status !== 'Pending' && b.status === 'Pending') return 1;
        // Fallback to createdAt sorting if available
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    return (
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">My Assigned Deliveries</h3>
            <div className="space-y-4">
                {loading ? (
                    <>
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </>
                ) : sortedTasks.length > 0 ? (
                    sortedTasks.map(task => (
                        <DriverTaskCard key={task.id} task={task} onComplete={onComplete} onViewReceipt={onViewReceipt} />
                    ))
                ) : (
                    <p className="text-gray-500 text-center py-8">You have no assigned deliveries.</p>
                )}
            </div>
        </div>
    );
}
