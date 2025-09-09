import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions";

interface AppHeaderProps {
    user: {
        displayName: string;
        role: string;
    };
    onAdminPanelOpen: () => void;
    onDriverDashboardOpen: () => void;
}

export function AppHeader({ user, onAdminPanelOpen, onDriverDashboardOpen }: AppHeaderProps) {
    const isAdmin = user.role === 'admin';
    const isUser = user.role === 'user';
    
    return (
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Delivery System</h1>
                <p className="text-gray-500 mt-1">
                    {user.role === 'driver' ? 'View and complete your assigned deliveries.' : 'Assign, track, and manage all job file deliveries.'}
                </p>
            </div>
            <div className="text-sm mt-4 sm:mt-0 text-right w-full sm:w-auto">
                <p className="font-medium">
                    Welcome, <span className="font-bold text-gray-800">{user.displayName}</span> (<span className="capitalize text-gray-600">{user.role}</span>)
                </p>
                <div className="flex items-center justify-end gap-4 mt-2">
                    {(isAdmin || isUser) && (
                        <Button onClick={onDriverDashboardOpen} variant="secondary" size="sm">Driver Dashboard</Button>
                    )}
                    {isAdmin && (
                        <Button onClick={onAdminPanelOpen} variant="default" size="sm">Admin Panel</Button>
                    )}
                    <form action={logout}>
                        <Button type="submit" variant="secondary" size="sm">Logout</Button>
                    </form>
                </div>
            </div>
        </header>
    );
}
