"use client"

import { useFormState, useFormStatus } from 'react-dom'
import { signup } from '@/app/actions'
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
      {pending ? 'Creating Account...' : 'Create an account'}
    </Button>
  )
}

export default function SignupPage() {
    const [state, formAction] = useFormState(signup, null)
    const { toast } = useToast()

    useEffect(() => {
        if (state?.type === 'error') {
            toast({
                variant: 'destructive',
                title: 'Signup Failed',
                description: state.message,
            })
        } else if (state?.type === 'success') {
            toast({
                title: 'Account Created',
                description: state.message,
            })
        }
    }, [state, toast])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="space-y-1 text-center">
            <QgoLogo className="text-4xl mb-2" />
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
              {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {state?.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password}</p>}
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" prefetch={false} className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

    