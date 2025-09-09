"use client"

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { forgotPassword } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { QgoLogo } from '@/components/shared/QgoLogo'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sending...' : 'Send Reset Link'}
    </Button>
  )
}

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(forgotPassword, null)
    const { toast } = useToast()

    useEffect(() => {
        if (state?.type === 'error') {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: state.message,
            })
        } else if (state?.type === 'success') {
            toast({
                title: 'Success',
                description: state.message,
            })
        }
    }, [state, toast])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-1 text-center">
            <QgoLogo className="text-4xl mb-2" />
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Remember your password?{' '}
            <Link href="/login" prefetch={false} className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
