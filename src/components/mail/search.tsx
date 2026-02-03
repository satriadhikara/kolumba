import { useState, useCallback } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, Cancel01Icon, Loading01Icon } from '@hugeicons/core-free-icons'
import { Input } from '@/components/ui/input'
import { searchEmailsFn } from '@/server/jmap'
import type { EmailListItem } from '@/lib/jmap/types'

interface SearchProps {
  onResults: (emails: EmailListItem[] | null) => void
  onClose: () => void
}

export function Search({ onResults, onClose }: SearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        onResults(null)
        return
      }

      setIsSearching(true)
      try {
        const result = await searchEmailsFn({ data: { query: searchQuery } })
        onResults(result.emails)
      } catch (error) {
        console.error('Search failed:', error)
        onResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [onResults]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleClear = () => {
    setQuery('')
    onResults(null)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <HugeiconsIcon
          icon={isSearching ? Loading01Icon : Search01Icon}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search emails..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  )
}
