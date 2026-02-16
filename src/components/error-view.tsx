import { useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Alert02Icon,
  ArrowLeftIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'

interface ErrorViewProps {
  error: Error
  reset?: () => void
}

export function ErrorView({ error, reset }: ErrorViewProps) {
  const router = useRouter()

  const handleRetry = () => {
    if (reset) {
      reset()
    } else {
      router.invalidate()
    }
  }

  const handleGoBack = () => {
    router.navigate({ to: '/mail/$mailboxId', params: { mailboxId: 'inbox' } })
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6">
      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <HugeiconsIcon
          icon={Alert02Icon}
          className="h-6 w-6 text-destructive"
        />
      </div>

      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>

      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={handleGoBack}>
          <HugeiconsIcon icon={ArrowLeftIcon} className="h-4 w-4 mr-2" />
          Go to Inbox
        </Button>
        <Button size="sm" onClick={handleRetry}>
          <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </div>
    </div>
  )
}
