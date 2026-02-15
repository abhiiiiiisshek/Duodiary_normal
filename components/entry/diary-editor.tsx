'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { updateEntry, deleteEntry } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2, Lock, Unlock, ArrowLeft, ArrowRight, Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

interface Entry {
    id: string
    content: string
    is_private: boolean
    updated_at: string
}

interface DiaryEditorProps {
    entry?: Entry
    isGuest?: boolean
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null

    const items = [
        {
            icon: Bold,
            title: 'Bold',
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: () => editor.isActive('bold'),
        },
        {
            icon: Italic,
            title: 'Italic',
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: () => editor.isActive('italic'),
        },
        {
            icon: Strikethrough,
            title: 'Strike',
            action: () => editor.chain().focus().toggleStrike().run(),
            isActive: () => editor.isActive('strike'),
        },
        {
            type: 'divider',
        },
        {
            icon: Heading1,
            title: 'Heading 1',
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: () => editor.isActive('heading', { level: 1 }),
        },
        {
            icon: Heading2,
            title: 'Heading 2',
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: () => editor.isActive('heading', { level: 2 }),
        },
        {
            icon: List,
            title: 'Bullet List',
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: () => editor.isActive('bulletList'),
        },
        {
            icon: ListOrdered,
            title: 'Ordered List',
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: () => editor.isActive('orderedList'),
        },
        {
            type: 'divider',
        },
        {
            icon: Quote,
            title: 'Blockquote',
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: () => editor.isActive('blockquote'),
        },
        {
            type: 'divider',
        },
        {
            icon: Undo,
            title: 'Undo',
            action: () => editor.chain().focus().undo().run(),
            disabled: () => !editor.can().undo(),
        },
        {
            icon: Redo,
            title: 'Redo',
            action: () => editor.chain().focus().redo().run(),
            disabled: () => !editor.can().redo(),
        },
    ]

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-secondary/30 backdrop-blur-md rounded-lg border border-border/50 mb-4 sticky top-20 z-20 shadow-sm transition-all duration-300">
            {items.map((item, index) => {
                if (item.type === 'divider') {
                    return <div key={index} className="w-px h-6 bg-border/50 mx-1" />
                }
                const Icon = item.icon!
                return (
                    <button
                        key={index}
                        onClick={item.action}
                        disabled={item.disabled?.()}
                        className={cn(
                            "p-2 rounded-md transition-all duration-200 hover:bg-background/80 hover:text-foreground hover:shadow-sm",
                            item.isActive?.() ? "bg-background text-primary shadow-sm ring-1 ring-border" : "text-muted-foreground",
                            item.disabled?.() && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground hover:shadow-none"
                        )}
                        title={item.title}
                    >
                        <Icon className="w-4 h-4" />
                    </button>
                )
            })}
        </div>
    )
}

export default function DiaryEditor({ entry, isGuest = false }: DiaryEditorProps) {
    const [isPrivate, setIsPrivate] = useState(entry?.is_private ?? true)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(entry?.updated_at || new Date().toISOString())
    // For tracking changes
    const [lastSavedContent, setLastSavedContent] = useState(entry?.content || '')
    const [lastSavedPrivate, setLastSavedPrivate] = useState(entry?.is_private ?? true)
    const [wordCount, setWordCount] = useState(0)
    const [charCount, setCharCount] = useState(0)

    const router = useRouter()
    const { theme } = useTheme()

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your diary entry here...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:float-left before:pointer-events-none before:h-0',
            }),
        ],
        content: entry?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[300px]',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            const text = editor.getText()
            setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
            setCharCount(text.length)

            // Trigger auto-save logic handled in useEffect
        },
    })

    // Load from local storage for guest
    useEffect(() => {
        if (isGuest && editor) {
            const saved = localStorage.getItem('guest_entry')
            if (saved && saved !== editor.getHTML()) {
                editor.commands.setContent(saved)
            }
        }
    }, [isGuest, editor])

    // Debounced save
    useEffect(() => {
        if (!editor) return

        const handler = setTimeout(async () => {
            const currentContent = editor.getHTML()

            if (currentContent !== lastSavedContent || isPrivate !== lastSavedPrivate) {
                if (isGuest) {
                    localStorage.setItem('guest_entry', currentContent)
                    setLastSaved(new Date().toISOString())
                    setLastSavedContent(currentContent)
                } else if (entry) {
                    setIsSaving(true)
                    try {
                        const text = editor.getText()
                        await updateEntry(entry.id, {
                            content: currentContent,
                            is_private: isPrivate,
                            word_count: text.trim().split(/\s+/).length,
                            char_count: text.length
                        })
                        setLastSaved(new Date().toISOString())
                        setLastSavedContent(currentContent)
                        setLastSavedPrivate(isPrivate)
                    } catch (error) {
                        console.error('Auto-save failed', error)
                    } finally {
                        setIsSaving(false)
                    }
                }
            }
        }, 1000)

        return () => clearTimeout(handler)
    }, [editor?.getHTML(), isPrivate, entry, lastSavedContent, lastSavedPrivate, isGuest, editor])

    const handleDelete = async () => {
        if (isGuest) {
            localStorage.removeItem('guest_entry')
            editor?.commands.setContent('')
            return
        }
        if (confirm('Are you sure you want to delete this entry?')) {
            await deleteEntry(entry!.id)
            router.push('/dashboard')
        }
    }

    const handleGuestSave = () => {
        if (editor) {
            localStorage.setItem('guest_entry', editor.getHTML())
            router.push('/login?signup=true')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-4xl mx-auto p-6"
        >
            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .ProseMirror:focus {
                    outline: none;
                }
                /* Typography enhancements */
                .ProseMirror h1 {
                    font-size: 2.25rem;
                    line-height: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                    color: hsl(var(--foreground));
                }
                .ProseMirror h2 {
                    font-size: 1.5rem;
                    line-height: 2rem;
                    font-weight: 600;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: hsl(var(--foreground));
                }
                .ProseMirror p {
                    margin-bottom: 1rem;
                    line-height: 1.75;
                }
                .ProseMirror ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .ProseMirror ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .ProseMirror blockquote {
                    border-left: 4px solid hsl(var(--primary) / 0.5);
                    padding-left: 1rem;
                    font-style: italic;
                    color: hsl(var(--muted-foreground));
                    margin-bottom: 1rem;
                }
            `}</style>

            {/* Header / Stats Bar */}
            <motion.div
                className="flex justify-between items-center mb-6 sticky top-0 bg-background/80 backdrop-blur-md z-30 py-4 border-b border-border/50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(isGuest ? '/' : '/dashboard')}
                        className="p-2 -ml-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all group"
                        title="Back"
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    {!isGuest && (
                        <div className="text-sm font-medium text-muted-foreground/80 flex items-center gap-2">
                            <span className="hidden sm:inline">Last edited</span>
                            {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                        <AnimatePresence mode='wait'>
                            {isSaving ? (
                                <motion.div
                                    key="saving"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-2 text-primary"
                                >
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="hidden sm:inline">Saving...</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="saved"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <Save className="h-3 w-3 text-green-500" />
                                    <span className="hidden sm:inline">{isGuest ? 'Draft Saved' : 'Saved'}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {!isGuest && (
                        <button
                            onClick={() => setIsPrivate(!isPrivate)}
                            className={cn(
                                "p-2 rounded-full transition-all duration-300 relative group overflow-hidden",
                                isPrivate ? "bg-amber-100/50 text-amber-600 hover:bg-amber-100" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                            title={isPrivate ? "Private: Only you can see this" : "Shared: Partner can see this"}
                        >
                            <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity" />
                            <AnimatePresence mode='wait'>
                                {isPrivate ? (
                                    <motion.div key="lock" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 20 }}>
                                        <Lock className="h-4 w-4" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="unlock" initial={{ scale: 0, rotate: 20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -20 }}>
                                        <Unlock className="h-4 w-4" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    )}

                    <button
                        onClick={handleDelete}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-all hover:rotate-12"
                        title={isGuest ? "Clear Draft" : "Delete Entry"}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>

            {/* Formatting Toolbar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <MenuBar editor={editor} />
            </motion.div>

            {/* Editor Content */}
            <motion.div
                className="min-h-[60vh] relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <EditorContent editor={editor} className="outline-none" />
            </motion.div>

            {/* Guest CTA */}
            <AnimatePresence>
                {isGuest && (wordCount > 5) && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-8 left-0 right-0 flex justify-center px-4 pointer-events-none z-50"
                    >
                        <button
                            onClick={handleGuestSave}
                            className="pointer-events-auto bg-primary text-primary-foreground px-8 py-3 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 font-medium ring-4 ring-primary/10 backdrop-blur-md"
                        >
                            Save & Create Account
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-xs text-muted-foreground flex justify-between border-t border-border/50 pt-4"
            >
                <span className="font-mono bg-muted/30 px-2 py-1 rounded border border-border/30">{wordCount} words</span>
                <span className="font-mono bg-muted/30 px-2 py-1 rounded border border-border/30">{charCount} characters</span>
            </motion.div>
        </motion.div>
    )
}
