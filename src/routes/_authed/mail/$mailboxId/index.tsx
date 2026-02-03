import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { MailIcon } from '@hugeicons/core-free-icons'

export const Route = createFileRoute('/_authed/mail/$mailboxId/')({
  component: NoMessageSelected,
})

function NoMessageSelected() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
      <HugeiconsIcon icon={MailIcon} className="h-12 w-12 mb-4 opacity-50" />
      <p>Select an email to read</p>
    </div>
  )
}
