"use client";

import { Card } from "../ui/card";

export default function DriverPerformanceSummary({ deliveries, feedback }: { deliveries: any[], feedback: any[] }) {
    const completed = deliveries.filter(d => d.status === 'Delivered').length;
    const pending = deliveries.length - completed;

    const totalRatings = feedback.length;
    const averageRating = totalRatings > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalRatings) : 0;
    const starRating = '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating));

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Card className="bg-yellow-100 p-4" title={`Average Rating: ${averageRating.toFixed(2)} (${totalRatings} ratings)`}>
                <p className="text-sm text-yellow-800">My Average Rating</p>
                <p className="text-3xl font-bold text-yellow-500 mt-1">{starRating}</p>
            </Card>
            <Card className="bg-green-100 p-4">
                <p className="text-sm text-green-800">Completed Deliveries</p>
                <p className="text-3xl font-bold text-green-900">{completed}</p>
            </Card>
            <Card className="bg-blue-100 p-4">
                <p className="text-sm text-blue-800">Pending Deliveries</p>
                <p className="text-3xl font-bold text-blue-900">{pending}</p>
            </Card>
        </div>
    );
}
