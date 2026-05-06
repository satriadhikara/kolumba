import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { getSessionFn, loginFn } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    try {
      const result = await loginFn({ data: { username, password } })

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
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 items-center justify-center p-12 overflow-hidden">
        {/* Decorative blur circles */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold tracking-tighter text-white mb-4">
            Kolumba
          </h1>
          <p className="text-xl text-white/70 font-light">
            Your mail, beautifully.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="lg:hidden mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tighter">Kolumba</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your mail, beautifully.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Connect to your Stalwart mail server
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="user@example.com"
                required
                autoComplete="username"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="h-11 rounded-xl"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-full font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
