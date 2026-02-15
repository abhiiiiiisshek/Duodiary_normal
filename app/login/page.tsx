'use client'

import AuthForm from '@/components/auth/auth-form'
import { useEffect, useState } from 'react'

export default function LoginPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background overflow-hidden relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <div
                className="z-10 w-full px-4 flex flex-col items-center animate-[fadeInScale_0.5s_ease-out_forwards]"
                style={{
                    animation: 'fadeInScale 0.5s ease-out forwards',
                }}
            >
                <style>{`
                    @keyframes fadeInScale {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}</style>
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        DualDiary
                    </h1>
                </div>
                <AuthForm />
            </div>
        </div>
    )
}
