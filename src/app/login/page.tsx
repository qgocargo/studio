"use client"

import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/app/actions'
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
      {pending ? 'Logging in...' : 'Login'}
    </Button>
  )
}

export default function LoginPage() {
    const [state, formAction] = useFormState(login, null)
    const { toast } = useToast()

    useEffect(() => {
        if (state?.type === 'error') {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: state.message,
            })
        }
    }, [state, toast])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-1 text-center">
            <QgoLogo className="text-4xl mb-2" />
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" prefetch={false} className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
              {state?.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password}</p>}
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" prefetch={false} className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

    