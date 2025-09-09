
"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions";
import { getAuth, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const { toast } = useToast();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth); // Sign out from Firebase on the client
            await logout(); // Call server action to clear session
        } catch (error) {
            console.error("Logout failed:", error);
            toast({
                variant: "destructive",
                title: "Logout Failed",
                description: "An error occurred during logout. Please try again.",
            });
        }
    };

    return (
        <form action={handleLogout}>
            <Button type="submit" variant="secondary" size="sm">Logout</Button>
        </form>
    );
}
