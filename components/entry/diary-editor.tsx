'use client'

import { useState, useEffect, useRef } from 'react'
import { updateEntry, deleteEntry } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2, Lock, Unlock, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export default function DiaryEditor({ entry, isGuest = false }: DiaryEditorProps) {
    const [content, setContent] = useState(entry?.content || '')
    const [isPrivate, setIsPrivate] = useState(entry?.is_private || true)
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(entry?.updated_at || new Date().toISOString())

    // Track last saved state to prevent infinite loops
    const [lastSavedContent, setLastSavedContent] = useState(entry?.content || '')
    const [lastSavedPrivate, setLastSavedPrivate] = useState(entry?.is_private || true)

    const router = useRouter()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Load from local storage for guest
    useEffect(() => {
        if (isGuest) {
            const saved = localStorage.getItem('guest_entry')
            if (saved) {
                setContent(saved)
            }
        }
    }, [isGuest])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [content])

    // Debounced save
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (content !== lastSavedContent || isPrivate !== lastSavedPrivate) {
                if (isGuest) {
                    localStorage.setItem('guest_entry', content)
                    setLastSaved(new Date().toISOString())
                    setLastSavedContent(content)
                } else if (entry) {
                    setIsSaving(true)
                    try {
                        await updateEntry(entry.id, {
                            content,
                            is_private: isPrivate,
                            word_count: content.trim().split(/\s+/).length,
                            char_count: content.length
                        })
                        setLastSaved(new Date().toISOString())
                        setLastSavedContent(content)
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
    }, [content, isPrivate, entry, lastSavedContent, lastSavedPrivate, isGuest])

    const handleDelete = async () => {
        if (isGuest) {
            localStorage.removeItem('guest_entry')
            setContent('')
            return
        }
        if (confirm('Are you sure you want to delete this entry?')) {
            await deleteEntry(entry!.id)
            router.push('/dashboard')
        }
    }

    const handleGuestSave = () => {
        localStorage.setItem('guest_entry', content)
        router.push('/login?signup=true')
    }

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

    return (
        <div
            style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}
            className="max-w-3xl mx-auto p-6"
        >
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-4 border-b">
                <button
                    onClick={() => router.push(isGuest ? '/' : '/dashboard')}
                    className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </button>

                <div className="flex items-center gap-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Save className="h-3 w-3" />
                                {isGuest ? 'Draft Saved locally' : 'Saved'}
                            </span>
                        )}
                    </div>

                    {!isGuest && (
                        <button
                            onClick={() => setIsPrivate(!isPrivate)}
                            className={cn(
                                "p-2 rounded-full transition-colors",
                                isPrivate ? "bg-amber-100 text-amber-600" : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                            title={isPrivate ? "Private: Only you can see this" : "Shared: Partner can see this"}
                        >
                            {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                    )}

                    <button
                        onClick={handleDelete}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                        title={isGuest ? "Clear Draft" : "Delete Entry"}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="min-h-[60vh]">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your diary entry here..."
                    className="w-full bg-transparent border-none text-lg leading-relaxed resize-none focus:ring-0 outline-none placeholder:text-muted-foreground/50"
                    style={{ minHeight: '300px' }}
                />
            </div>

            {/* Guest CTA */}
            {isGuest && content.length > 10 && (
                <div
                    style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}
                    className="fixed bottom-8 left-0 right-0 flex justify-center px-4"
                >
                    <button
                        onClick={handleGuestSave}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-medium"
                    >
                        Save & Create Account
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Footer Stats */}
            <div className="mt-8 text-xs text-muted-foreground flex justify-between border-t pt-4">
                <span>{wordCount} words</span>
                <span>{content.length} characters</span>
            </div>
        </div>
    )
}
