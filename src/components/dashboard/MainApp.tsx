"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import DriverDashboard from "@/components/dashboard/DriverDashboard";
import AdminPanelModal from "@/components/modals/AdminPanelModal";
import DriverPerformanceModal from "../modals/DriverPerformanceModal";

export default function MainApp({ user, initialData }: { user: any; initialData: any }) {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isDriverDashboardOpen, setIsDriverDashboardOpen] = useState(false);

  return (
    <>
      <AppHeader
        user={user}
        onAdminPanelOpen={() => setIsAdminPanelOpen(true)}
        onDriverDashboardOpen={() => setIsDriverDashboardOpen(true)}
      />

      {user.role === 'driver' ? (
        <DriverDashboard user={user} initialDeliveries={initialData.deliveries || []} initialFeedback={initialData.feedback || []} />
      ) : (
        <AdminDashboard user={user} initialData={initialData} />
      )}

      {user.role === 'admin' && (
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          users={initialData.users || []}
          currentUser={user}
        />
      )}
      
      {(user.role === 'admin' || user.role === 'user') && (
        <DriverPerformanceModal
            isOpen={isDriverDashboardOpen}
            onClose={() => setIsDriverDashboardOpen(false)}
            deliveries={initialData.deliveries || []}
            users={initialData.users || []}
            feedback={initialData.feedback || []}
        />
      )}
    </>
  );
}
