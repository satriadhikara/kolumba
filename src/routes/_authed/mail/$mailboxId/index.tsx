import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { MailIcon } from '@hugeicons/core-free-icons'

export const Route = createFileRoute('/_authed/mail/$mailboxId/')({
  component: NoMessageSelected,
})

function NoMessageSelected() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-muted-foreground relative">
      {/* Atmospheric glow */}
      <div className="absolute w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        <HugeiconsIcon icon={MailIcon} className="h-12 w-12 mb-4 opacity-40" />
        <p className="font-medium">Select an email to read</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Choose a message from the list
        </p>
      </div>
    </div>
  )
}
