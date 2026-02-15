'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import DiaryEditor from '@/components/entry/diary-editor'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-transparent relative overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] mix-blend-multiply animate-blob" style={{ animationDelay: '2s' }} />
                <div className="absolute -bottom-32 left-1/2 w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] mix-blend-multiply animate-blob" style={{ animationDelay: '4s' }} />
            </div>

            <header className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-xl border-b border-white/10 dark:border-white/5 supports-[backdrop-filter]:bg-background/20">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                                Duodiary
                            </span>
                        </Link>
                    </motion.div>

                    <motion.nav
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex gap-6"
                    >
                        <Link href="/login" className="group relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary">
                            <span>Sign In</span>
                            <span className="absolute inset-x-0 -bottom-1 h-[2px] w-full scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                        </Link>
                    </motion.nav>
                </div>
            </header>

            <main className="relative pt-32 pb-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/50 text-sm text-foreground/80 mb-4"
                        >
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            <span>Reimagined for seamless connection</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight"
                        >
                            Your Private <br />
                            <span className="relative inline-block">
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-primary blur-2xl opacity-50" />
                                <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-primary pb-2">
                                    Shared Space
                                </span>
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                        >
                            A beautiful sanctuary for your thoughts. Start writing freely, connect deeply, and share when you're ready.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
                        className="relative z-10"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-violet-500 to-blue-500 rounded-2xl blur opacity-30 animate-pulse" />
                        <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden ring-1 ring-white/10">
                            <DiaryEditor isGuest={true} />
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
