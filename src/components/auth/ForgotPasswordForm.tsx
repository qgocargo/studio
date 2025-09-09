"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { forgotPassword } from "@/app/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full text-lg" disabled={pending}>
      {pending ? "Sending Link..." : "Send Reset Link"}
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>Enter your email and we'll send you a link to get back into your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.type === 'success' ? (
             <Alert variant="default" className="border-green-500 text-green-700">
               <CheckCircle2 className="h-4 w-4 text-green-700" />
               <AlertTitle className="text-green-800">Success!</AlertTitle>
               <AlertDescription className="text-green-700">
                {state.message}
               </AlertDescription>
             </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" placeholder="email@example.com" required />
              {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
            </div>
          )}


          {state?.type === "error" && state.message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {state?.type !== 'success' && <SubmitButton />}

          <div className="text-center text-sm text-gray-600">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Return to login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
