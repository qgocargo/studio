"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { updateUserStatuses } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminPanelModal({ isOpen, onClose, users, currentUser }: { isOpen: boolean, onClose: () => void, users: any[], currentUser: any }) {
    const [userStatuses, setUserStatuses] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleStatusChange = (uid: string, status: string) => {
        setUserStatuses(prev => ({ ...prev, [uid]: status }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const changedStatuses = Object.entries(userStatuses).map(([uid, status]) => ({ uid, status }));

        if(changedStatuses.length === 0) {
            toast({ variant: "default", title: "No Changes", description: "No user statuses were modified." });
            setIsSaving(false);
            return;
        }

        const result = await updateUserStatuses(changedStatuses);

        if (result.success) {
            toast({ title: "Success", description: result.message });
            onClose();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
        setIsSaving(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>User Management</DialogTitle>
                    <DialogDescription>View all users and manage their account status.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-2 pr-4">
                        {users.map(user => (
                            <div key={user.id} className="p-3 border-b grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <div className="col-span-1">
                                    <p className="font-medium">{user.displayName}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <p className="text-sm text-muted-foreground capitalize hidden md:block">{user.role}</p>
                                <div className="col-span-1">
                                    <Select
                                        defaultValue={user.status}
                                        onValueChange={(value) => handleStatusChange(user.id, value)}
                                        disabled={user.id === currentUser.id}
                                    >
                                        <SelectTrigger className="w-full md:w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
