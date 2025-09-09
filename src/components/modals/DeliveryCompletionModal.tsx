"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import SignaturePad from "../shared/SignaturePad";
import type SignaturePadType from "signature_pad";
import { useToast } from "@/hooks/use-toast";
import { completeDelivery } from "@/app/actions";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface GeolocationData {
    coords: {
        lat: number;
        lng: number;
    };
    displayName: string;
}

export default function DeliveryCompletionModal({ isOpen, onClose, delivery }: { isOpen: boolean, onClose: () => void, delivery: any }) {
    const [receiverName, setReceiverName] = useState("");
    const [receiverMobile, setReceiverMobile] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locationStatus, setLocationStatus] = useState("");
    const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
    const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);

    const sigPadRef = useRef<SignaturePadType | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Reset state when modal is closed or delivery changes
        if (!isOpen) {
            setReceiverName("");
            setReceiverMobile("");
            sigPadRef.current?.clear();
            setLocationStatus("");
            setGeolocation(null);
            setIsSubmitting(false);
            setQrCodeUri(null);
        }
    }, [isOpen, delivery]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus("Geolocation is not supported by your browser.");
            return;
        }

        setLocationStatus("Getting location...");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                setLocationStatus("Coordinates captured. Fetching address...");
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`);
                    const data = await response.json();
                    const displayName = data.display_name || 'Address not found';
                    setGeolocation({ coords, displayName });
                    setLocationStatus(`Location: ${displayName}`);
                } catch (error) {
                    setLocationStatus("Could not fetch address, but coordinates saved.");
                    setGeolocation({ coords, displayName: 'N/A' });
                }
            },
            () => { setLocationStatus("Unable to retrieve your location."); }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiverName || !receiverMobile) {
            toast({ variant: "destructive", title: "Error", description: "Receiver's name and mobile are required." });
            return;
        }
        if (sigPadRef.current?.isEmpty()) {
            toast({ variant: "destructive", title: "Error", description: "Receiver's signature is required." });
            return;
        }

        setIsSubmitting(true);
        const signatureDataUrl = sigPadRef.current?.toDataURL('image/jpeg', 0.5);

        const formData = new FormData();
        formData.append('deliveryId', delivery.id);
        formData.append('receiverName', receiverName);
        formData.append('receiverMobile', receiverMobile);
        formData.append('signatureDataUrl', signatureDataUrl || "");
        formData.append('deliveryData', JSON.stringify(delivery));
        if (geolocation) {
            formData.append('geolocation', JSON.stringify(geolocation));
        }

        const result = await completeDelivery(formData);

        if (result.success && result.qrCodeDataUri) {
            toast({ title: "Success", description: result.message });
            setQrCodeUri(result.qrCodeDataUri);
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message || "An unknown error occurred." });
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Complete Delivery</DialogTitle>
                </DialogHeader>
                {qrCodeUri ? (
                    <div className="text-center py-4">
                        <h3 className="text-xl font-bold text-gray-800">Delivery Complete!</h3>
                        <p className="text-gray-600 mt-2 mb-4">Please ask the customer to scan this QR code to rate their delivery experience.</p>
                        <div className="flex justify-center my-4">
                            <div className="p-2 bg-white border rounded-lg inline-block">
                                <Image src={qrCodeUri} alt="Feedback QR Code" width={150} height={150} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">The customer will use their own device to provide feedback.</p>
                        <DialogFooter className="mt-6">
                            <Button onClick={onClose}>Finish & Close</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-md border">
                            <p><strong>Job File:</strong> {delivery.jobFileData.jfn}</p>
                            <p><strong>Location:</strong> {delivery.deliveryLocation}</p>
                        </div>
                        <div>
                            <Label htmlFor="receiver-name">Receiver's Name</Label>
                            <Input id="receiver-name" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="receiver-mobile">Receiver's Mobile Number</Label>
                            <Input id="receiver-mobile" type="tel" value={receiverMobile} onChange={(e) => setReceiverMobile(e.target.value)} required />
                        </div>
                        <div>
                            <Label>Receiver's Signature</Label>
                            <SignaturePad onReady={(sigPad) => sigPadRef.current = sigPad} />
                            <div className="text-right mt-1">
                                <Button type="button" variant="secondary" size="sm" onClick={() => sigPadRef.current?.clear()}>Clear</Button>
                            </div>
                        </div>
                        <div>
                            <Button type="button" variant="secondary" className="w-full" onClick={handleGetLocation}>Get Current Location</Button>
                            <p className="text-xs text-muted-foreground mt-1 text-center">{locationStatus}</p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Mark as Delivered
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
