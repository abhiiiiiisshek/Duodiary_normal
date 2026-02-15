'use client'

import { createEntry } from '@/app/dashboard/actions'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Lock, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Entry {
    id: string
    content: string
    is_private: boolean
    updated_at: string
    created_at: string
    user_id: string
}

export default function EntryList({ entries, currentUserId }: { entries: Entry[], currentUserId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        setLoading(true)
        try {
            const id = await createEntry()
            router.push(`/dashboard/entry/${id}`)
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Entries</h2>
                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-4 w-4" />
                    New Entry
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entries.map((entry, index) => (
                    <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => router.push(`/dashboard/entry/${entry.id}`)}
                        className="group cursor-pointer bg-card border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between h-48"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(entry.created_at).toLocaleDateString()}
                                </span>
                                {entry.user_id !== currentUserId && (
                                    <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                                        Partner
                                    </span>
                                )}
                                {entry.is_private && (
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                            </div>
                            <p className="text-sm line-clamp-4 text-foreground/80">
                                {entry.content || <span className="text-muted-foreground italic">Empty entry...</span>}
                            </p>
                        </div>

                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-primary font-medium flex items-center">
                                Open <BookOpen className="h-3 w-3 ml-1" />
                            </span>
                        </div>
                    </motion.div>
                ))}

                {entries.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border-dashed border-2">
                        No entries yet. Start writing!
                    </div>
                )}
            </div>
        </div>
    )
}
