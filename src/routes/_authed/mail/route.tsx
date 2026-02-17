import { useEffect, useState } from 'react'
import { Link, Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  LogoutIcon,
  MoonIcon,
  PlusSignIcon,
  Search01Icon,
  SunIcon,
} from '@hugeicons/core-free-icons'
import { toast } from 'sonner'
import type { EmailListItem } from '@/lib/jmap/types'
import { getMailboxesFn } from '@/server/jmap'
import { logoutFn } from '@/server/auth'
import { MailboxList } from '@/components/mail/mailbox-list'
import { Search } from '@/components/mail/search'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorView } from '@/components/error-view'

export const Route = createFileRoute('/_authed/mail')({
  loader: async () => {
    const mailboxes = await getMailboxesFn()
    return { mailboxes }
  },
  pendingComponent: MailLayoutPending,
  errorComponent: MailLayoutError,
  component: MailLayout,
})

function MailLayout() {
  const { mailboxes } = Route.useLoaderData()
  const { session } = Route.useRouteContext()
  const [showSearch, setShowSearch] = useState(false)
  const [, setSearchResults] = useState<Array<EmailListItem> | null>(null)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutFn()
      await navigate({ to: '/login' })
    } catch {
      toast.error('Failed to log out')
    }
  }

  const toggleDarkMode = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light')
  }

  const handleSearchResults = (emails: Array<EmailListItem> | null) => {
    setSearchResults(emails)
  }

  const handleSearchClose = () => {
    setShowSearch(false)
    setSearchResults(null)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-4 shrink-0 gap-4">
        <h1 className="text-lg font-semibold">Kolumba</h1>

        {/* Search */}
        <div className="flex-1 max-w-md">
          {showSearch ? (
            <Search
              onResults={handleSearchResults}
              onClose={handleSearchClose}
            />
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setShowSearch(true)}
            >
              <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 mr-2" />
              Search emails...
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            <HugeiconsIcon
              icon={isDark ? SunIcon : MoonIcon}
              className="h-4 w-4"
            />
          </Button>

          {/* User info */}
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {session.username}
          </span>

          {/* Logout */}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <HugeiconsIcon icon={LogoutIcon} className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar - Mailbox list */}
        <aside className="w-56 border-r flex flex-col shrink-0">
          {/* Compose button */}
          <div className="p-3">
            <Link to="/mail/compose">
              <Button className="w-full">
                <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </Link>
          </div>

          <MailboxList mailboxes={mailboxes} />
        </aside>

        {/* Content area */}
        <main className="flex-1 flex min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function MailLayoutPending() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-4 shrink-0 gap-4">
        <h1 className="text-lg font-semibold">Kolumba</h1>
        <div className="flex-1 max-w-md">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="w-56 border-r flex flex-col shrink-0">
          <div className="p-3">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2">
            <div className="space-y-1">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-md px-3 py-2"
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-6" />
                </div>
              ))}
            </div>
          </div>
        </aside>
        <main className="flex-1 flex min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function MailLayoutError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-4 shrink-0 gap-4">
        <h1 className="text-lg font-semibold">Kolumba</h1>
        <div className="flex-1 max-w-md">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <aside className="w-56 border-r flex flex-col shrink-0">
          <div className="p-3">
            <Skeleton className="h-10 w-full" />
          </div>
        </aside>
        <main className="flex-1 flex min-w-0">
          <ErrorView error={error} reset={reset} />
        </main>
      </div>
    </div>
  )
}
