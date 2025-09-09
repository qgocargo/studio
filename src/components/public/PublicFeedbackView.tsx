"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { submitFeedback } from "@/app/actions";

import { QgoLogo } from "@/components/shared/QgoLogo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription }from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Feedback'}
        </Button>
    );
}

interface DeliveryInfo {
    jobNo: string;
    driverName: string;
}

export default function PublicFeedbackView({ feedbackId }: { feedbackId: string }) {
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    
    const [state, formAction] = useFormState(submitFeedback, null);

    useEffect(() => {
        async function fetchDeliveryData() {
            try {
                setIsLoading(true);
                const feedbackRef = doc(db, 'feedback', feedbackId);
                const feedbackSnap = await getDoc(feedbackRef);

                if (feedbackSnap.exists()) {
                    setAlreadySubmitted(true);
                    return;
                }

                const deliveryRef = doc(db, 'deliveries', feedbackId);
                const deliverySnap = await getDoc(deliveryRef);

                if (deliverySnap.exists()) {
                    const data = deliverySnap.data();
                    setDeliveryInfo({
                        jobNo: data.jobFileData.jfn,
                        driverName: data.driverName,
                    });
                } else {
                    setError("Could not find delivery details. The link may be invalid.");
                }
            } catch (err) {
                console.error("Error fetching feedback data:", err);
                setError("An error occurred while loading the feedback form.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchDeliveryData();
    }, [feedbackId]);
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-6">
                    <QgoLogo className="text-4xl" />
                </div>
                <Card>
                    {isLoading ? (
                        <CardContent className="p-8 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                            <p className="mt-2 text-muted-foreground">Loading form...</p>
                        </CardContent>
                    ) : error ? (
                        <CardContent className="p-8">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </CardContent>
                    ) : alreadySubmitted || state?.success ? (
                        <CardContent className="p-8 text-center space-y-3">
                             <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                            <h2 className="text-2xl font-bold text-gray-800">Thank You!</h2>
                            <p className="text-gray-600 mt-2">{state?.message || 'Your feedback has been submitted successfully.'}</p>
                        </CardContent>
                    ) : (
                        <>
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl">Rate Your Delivery</CardTitle>
                                <CardDescription>
                                    Job File: <span className="font-medium text-foreground">{deliveryInfo?.jobNo}</span>
                                    <br/>
                                    Driver: <span className="font-medium text-foreground">{deliveryInfo?.driverName}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={formAction} className="space-y-6">
                                    <input type="hidden" name="deliveryId" value={feedbackId} />
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-2 text-center">Your Rating</Label>
                                        <div className="rating-stars">
                                            <input type="radio" id="star5" name="rating" value="5" /><label htmlFor="star5" title="5 stars">★</label>
                                            <input type="radio" id="star4" name="rating" value="4" /><label htmlFor="star4" title="4 stars">★</label>
                                            <input type="radio" id="star3" name="rating" value="3" /><label htmlFor="star3" title="3 stars">★</label>
                                            <input type="radio" id="star2" name="rating" value="2" /><label htmlFor="star2" title="2 stars">★</label>
                                            <input type="radio" id="star1" name="rating" value="1" /><label htmlFor="star1" title="1 star">★</label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="feedback-comment">Comments (Optional)</Label>
                                        <Textarea id="feedback-comment" name="comment" rows={4} placeholder="Tell us about your experience..." />
                                    </div>

                                    {state?.success === false && state.message && (
                                        <Alert variant="destructive">
                                          <AlertCircle className="h-4 w-4" />
                                          <AlertTitle>Error</AlertTitle>
                                          <AlertDescription>{state.message}</AlertDescription>
                                        </Alert>
                                    )}

                                    <SubmitButton />
                                </form>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
