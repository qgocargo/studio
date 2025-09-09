import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle2, Truck } from "lucide-react";

export function StatCards({ deliveries }: { deliveries: any[] }) {
    const pendingCount = deliveries.filter(d => d.status !== 'Delivered').length;
    const completedCount = deliveries.filter(d => d.status === 'Delivered').length;
    const totalCount = deliveries.length;

    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex items-center gap-5 border-l-4 border-yellow-400 transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-4">
                    <div className="bg-yellow-100 p-3 rounded-full">
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <p className="text-base text-gray-500">Pending</p>
                    <p className="text-3xl font-extrabold text-gray-800">{pendingCount}</p>
                </CardContent>
            </Card>
            <Card className="flex items-center gap-5 border-l-4 border-green-400 transition-all hover:shadow-lg hover:-translate-y-1">
                 <CardHeader className="p-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <p className="text-base text-gray-500">Completed</p>
                    <p className="text-3xl font-extrabold text-gray-800">{completedCount}</p>
                </CardContent>
            </Card>
            <Card className="flex items-center gap-5 border-l-4 border-blue-400 transition-all hover:shadow-lg hover:-translate-y-1">
                 <CardHeader className="p-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Truck className="h-8 w-8 text-blue-600" />
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <p className="text-base text-gray-500">Total Deliveries</p>
                    <p className="text-3xl font-extrabold text-gray-800">{totalCount}</p>
                </CardContent>
            </Card>
        </section>
    );
}
