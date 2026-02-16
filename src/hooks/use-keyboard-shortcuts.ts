import { useCallback, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import {
  archiveEmailFn,
  deleteEmailFn,
  markAsReadFn,
  markAsUnreadFn,
  toggleStarFn,
} from '@/server/jmap'

interface KeyboardShortcutsOptions {
  emails?: Array<{ id: string; keywords: Record<string, boolean> }>
  selectedIndex?: number
  onSelectPrevious?: () => void
  onSelectNext?: () => void
  onSelect?: (index: number) => void
}

/**
 * Keyboard shortcuts hook for email navigation and actions
 *
 * Shortcuts:
 * - j/k: Navigate messages down/up
 * - r: Reply
 * - a: Reply all
 * - f: Forward
 * - e: Archive
 * - #: Delete
 * - c: Compose
 * - Escape: Close/back
 * - s: Star/unstar
 * - u: Mark as unread
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const router = useRouter()
  const {
    emails = [],
    selectedIndex = -1,
    onSelectPrevious,
    onSelectNext,
    onSelect,
  } = options

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      const selectedEmail = selectedIndex >= 0 ? emails[selectedIndex] : null

      switch (event.key) {
        case 'j':
          // Next message
          if (onSelectNext) {
            event.preventDefault()
            onSelectNext()
          }
          break

        case 'k':
          // Previous message
          if (onSelectPrevious) {
            event.preventDefault()
            onSelectPrevious()
          }
          break

        case 'c':
          // Compose
          event.preventDefault()
          router.navigate({ to: '/mail/compose' })
          break

        case 'r':
          // Reply
          if (selectedEmail) {
            event.preventDefault()
            router.navigate({
              to: '/mail/compose',
              search: { replyTo: selectedEmail.id },
            })
          }
          break

        case 'a':
          // Reply all
          if (selectedEmail) {
            event.preventDefault()
            router.navigate({
              to: '/mail/compose',
              search: { replyTo: selectedEmail.id, replyAll: true },
            })
          }
          break

        case 'f':
          // Forward
          if (selectedEmail) {
            event.preventDefault()
            router.navigate({
              to: '/mail/compose',
              search: { forward: selectedEmail.id },
            })
          }
          break

        case 'e':
          // Archive
          if (selectedEmail) {
            event.preventDefault()
            try {
              await archiveEmailFn({ data: { emailId: selectedEmail.id } })
              router.invalidate()
            } catch (err) {
              console.error('Failed to archive:', err)
            }
          }
          break

        case '#':
          // Delete
          if (selectedEmail) {
            event.preventDefault()
            try {
              await deleteEmailFn({ data: { emailId: selectedEmail.id } })
              router.invalidate()
            } catch (err) {
              console.error('Failed to delete:', err)
            }
          }
          break

        case 's':
          // Star/unstar
          if (selectedEmail) {
            event.preventDefault()
            const isStarred = selectedEmail.keywords['$flagged']
            try {
              await toggleStarFn({
                data: { emailId: selectedEmail.id, starred: !isStarred },
              })
              router.invalidate()
            } catch (err) {
              console.error('Failed to toggle star:', err)
            }
          }
          break

        case 'u':
          // Mark as unread
          if (selectedEmail) {
            event.preventDefault()
            const isRead = selectedEmail.keywords['$seen']
            try {
              if (isRead) {
                await markAsUnreadFn({ data: { emailId: selectedEmail.id } })
              } else {
                await markAsReadFn({ data: { emailId: selectedEmail.id } })
              }
              router.invalidate()
            } catch (err) {
              console.error('Failed to toggle read status:', err)
            }
          }
          break

        case 'Escape':
          // Close/back
          event.preventDefault()
          router.history.back()
          break

        case 'Enter':
          // Open selected email
          if (selectedEmail && onSelect) {
            event.preventDefault()
            onSelect(selectedIndex)
          }
          break
      }
    },
    [router, emails, selectedIndex, onSelectPrevious, onSelectNext, onSelect],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Get keyboard shortcut help text
 */
export function getKeyboardShortcuts() {
  return [
    { key: 'j', description: 'Next message' },
    { key: 'k', description: 'Previous message' },
    { key: 'c', description: 'Compose new email' },
    { key: 'r', description: 'Reply' },
    { key: 'a', description: 'Reply all' },
    { key: 'f', description: 'Forward' },
    { key: 'e', description: 'Archive' },
    { key: '#', description: 'Delete' },
    { key: 's', description: 'Star/unstar' },
    { key: 'u', description: 'Toggle read/unread' },
    { key: 'Esc', description: 'Go back' },
  ]
}
