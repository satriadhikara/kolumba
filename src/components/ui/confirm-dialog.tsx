'use client'

import { useCallback, useState } from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon } from '@hugeicons/core-free-icons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function useConfirmDialog() {
  const [config, setConfig] = useState<Omit<
    ConfirmDialogProps,
    'open' | 'onOpenChange'
  > | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const confirm = useCallback(
    (dialogConfig: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>) => {
      setConfig(dialogConfig)
      setIsOpen(true)
    },
    [],
  )

  const handleConfirm = useCallback(async () => {
    if (config?.onConfirm) {
      await config.onConfirm()
    }
    setIsOpen(false)
  }, [config])

  const ConfirmDialogComponent = useCallback(() => {
    if (!config) return null

    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              {config.variant === 'destructive' && (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    className="size-5 text-destructive"
                  />
                </div>
              )}
              <AlertDialogTitle>{config.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="mt-2">
              {config.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {config.cancelText || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              variant={
                config.variant === 'destructive' ? 'destructive' : 'default'
              }
              onClick={handleConfirm}
            >
              {config.confirmText || 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }, [config, isOpen, handleConfirm])

  return { confirm, ConfirmDialogComponent }
}
