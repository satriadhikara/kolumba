import { useState } from 'react'
import {
  Link,
  Outlet,
  createFileRoute,
  useRouterState,
} from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  LogoutIcon,
  MoonIcon,
  PlusSignIcon,
  Search01Icon,
  SunIcon,
} from '@hugeicons/core-free-icons'
import type { EmailListItem } from '@/lib/jmap/types'
import { getMailboxesFn } from '@/server/jmap'
import { logoutFn } from '@/server/auth'
import { setThemeFn } from '@/server/theme'
import { MailboxList } from '@/components/mail/mailbox-list'
import { Search } from '@/components/mail/search'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authed/mail')({
  loader: async () => {
    const mailboxes = await getMailboxesFn()
    return { mailboxes }
  },
  component: MailLayout,
})

function MailLayout() {
  const { mailboxes } = Route.useLoaderData()
  const { session, theme } = Route.useRouteContext()
  const [showSearch, setShowSearch] = useState(false)
  const [, setSearchResults] = useState<Array<EmailListItem> | null>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isComposeRoute = pathname === '/mail/compose'

  const handleLogout = async () => {
    await logoutFn()
  }

  const toggleDarkMode = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    await setThemeFn({ data: { theme: newTheme } })
    window.location.reload()
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
              icon={theme === 'dark' ? SunIcon : MoonIcon}
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

          {!isComposeRoute && <MailboxList mailboxes={mailboxes} />}
        </aside>

        {/* Content area */}
        <main className="flex-1 flex min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
