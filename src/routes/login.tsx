import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { getSessionFn, loginFn } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    // If already authenticated, redirect to mail
    const session = await getSessionFn()
    if (session) {
      throw redirect({ to: '/mail/$mailboxId', params: { mailboxId: 'inbox' } })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const jmapUrl = formData.get('jmapUrl') as string
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    try {
      const result = await loginFn({ data: { jmapUrl, username, password } })

      if (result.error) {
        setError(result.error)
      } else {
        navigate({ to: '/mail/$mailboxId', params: { mailboxId: 'inbox' } })
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Kolumba</CardTitle>
          <CardDescription>
            Sign in to your Stalwart mail server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jmapUrl">Mail Server URL</Label>
              <Input
                id="jmapUrl"
                name="jmapUrl"
                type="url"
                placeholder="https://mail.example.com"
                required
                autoComplete="url"
              />
              <p className="text-xs text-muted-foreground">
                The URL of your Stalwart JMAP server
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="user@example.com"
                required
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
