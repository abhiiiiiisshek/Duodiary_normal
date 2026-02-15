'use client'

import { useState } from 'react'
import { generateInviteCode, joinRelationship } from './actions'
import { Loader2, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InviteSection({
    inviteCode,
    relationshipId
}: {
    inviteCode: string | null,
    relationshipId: string | null
}) {
    const [loading, setLoading] = useState(false)
    const [inputCode, setInputCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            await generateInviteCode()
        } catch (e) {
            setError('Failed to generate code')
        } finally {
            setLoading(false)
        }
    }

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await joinRelationship(inputCode)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const copyCode = () => {
        if (inviteCode) {
            navigator.clipboard.writeText(inviteCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (relationshipId) return null

    return (
        <div className="max-w-md w-full mx-auto space-y-8 p-6 bg-card rounded-xl border shadow-sm">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Connect with Partner</h2>
                <p className="text-muted-foreground text-sm">
                    Share your code or enter your partner's code to start your shared diary.
                </p>
            </div>

            <div className="space-y-4">
                {/* Generate Code Section */}
                <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-border">
                    <label className="text-xs font-medium uppercase text-muted-foreground mb-2 block">
                        Your Invite Code
                    </label>
                    <div className="flex items-center gap-2">
                        {inviteCode ? (
                            <div className="flex-1 flex items-center justify-between bg-background p-2 px-3 rounded border font-mono text-lg tracking-wider">
                                {inviteCode}
                                <button
                                    onClick={copyCode}
                                    className="p-1 hover:bg-muted rounded transition-colors"
                                >
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity text-sm font-medium"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Generate Code'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                </div>

                {/* Enter Code Section */}
                <form onSubmit={handleJoin} className="space-y-3">
                    <label className="text-xs font-medium uppercase text-muted-foreground block">
                        Enter Partner's Code
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            placeholder="XXXXXX"
                            className="flex-1 bg-background border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono uppercase"
                            maxLength={6}
                        />
                        <button
                            type="submit"
                            disabled={loading || !inputCode}
                            className="px-4 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors font-medium disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
                        </button>
                    </div>
                    {error && (
                        <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
                            {error}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
