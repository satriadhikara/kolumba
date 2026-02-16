import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  BulletIcon,
  LinkSquare01Icon,
  QuoteDownIcon,
  TextAlignLeft01Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function ToolbarButton({
  icon: Icon,
  isActive,
  onClick,
  title,
}: {
  icon: typeof TextBoldIcon
  isActive?: boolean
  onClick: () => void
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded-md transition-colors',
        'hover:bg-muted',
        isActive ? 'bg-muted text-accent' : 'text-muted-foreground',
      )}
    >
      <HugeiconsIcon icon={Icon} className="h-4 w-4" />
    </button>
  )
}

function LinkInput({
  url,
  onChange,
  onSubmit,
  onCancel,
}: {
  url: string
  onChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Input
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://"
        className="h-7 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit()
          if (e.key === 'Escape') onCancel()
        }}
      />
      <Button size="sm" variant="ghost" onClick={onSubmit} className="h-7">
        Save
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel} className="h-7">
        Cancel
      </Button>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your message...',
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLinkInput, setShowLinkInput] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline',
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: editorInstance }) => {
      onChange(editorInstance.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      const isSame = editor.getHTML() === value
      if (!isSame) {
        editor.commands.setContent(value)
      }
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const handleSetLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const handleUnsetLink = () => {
    editor.chain().focus().unsetLink().run()
    setLinkUrl('')
    setShowLinkInput(false)
  }

  return (
    <div className="flex flex-col border rounded-md bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-1 border-b bg-muted/30">
        {/* Text Formatting */}
        <ToolbarButton
          icon={TextBoldIcon}
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={TextItalicIcon}
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={TextUnderlineIcon}
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={TextStrikethroughIcon}
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        />

        <div className="w-px h-5 bg-border mx-1" />

        {/* Link */}
        <ToolbarButton
          icon={LinkSquare01Icon}
          isActive={editor.isActive('link')}
          onClick={() => {
            if (editor.isActive('link')) {
              handleUnsetLink()
            } else {
              setShowLinkInput(true)
              setLinkUrl('')
            }
          }}
          title="Link"
        />

        <div className="w-px h-5 bg-border mx-1" />

        {/* Lists */}
        <ToolbarButton
          icon={BulletIcon}
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        />
        <ToolbarButton
          icon={TextAlignLeft01Icon}
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        />

        <div className="w-px h-5 bg-border mx-1" />

        {/* Blockquote */}
        <ToolbarButton
          icon={QuoteDownIcon}
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        />

        {/* Headings */}
        <div className="w-px h-5 bg-border mx-1" />
        <select
          className="h-7 px-2 text-xs bg-transparent border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          value={
            editor.isActive('heading', { level: 1 })
              ? '1'
              : editor.isActive('heading', { level: 2 })
                ? '2'
                : editor.isActive('heading', { level: 3 })
                  ? '3'
                  : '0'
          }
          onChange={(e) => {
            const level = parseInt(e.target.value)
            if (level === 0) {
              editor.chain().focus().setParagraph().run()
            } else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 })
                .run()
            }
          }}
        >
          <option value="0">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <LinkInput
          url={linkUrl}
          onChange={setLinkUrl}
          onSubmit={handleSetLink}
          onCancel={() => {
            setShowLinkInput(false)
            setLinkUrl('')
          }}
        />
      )}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="min-h-[200px] p-3 prose prose-zinc dark:prose-invert max-w-none focus:outline-none"
        />
      </div>

      {/* Editor Styles */}
      <style>{`
        .ProseMirror {
          min-height: 200px;
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #a1a1aa;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #d4d4d8;
          padding-left: 1rem;
          margin-left: 0;
          color: #71717a;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
        }
        .ProseMirror h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .ProseMirror a {
          color: var(--accent);
          text-decoration: underline;
        }
        .dark .ProseMirror blockquote {
          border-left-color: #52525b;
          color: #a1a1aa;
        }
      `}</style>
    </div>
  )
}
