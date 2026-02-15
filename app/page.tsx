import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DiaryEditor from '@/components/entry/diary-editor'

export default async function Home() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold">
                        DualDiary
                    </Link>
                    <nav className="flex gap-6">
                        <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                            Sign In
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Your Private Shared Space
                    </h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        Start writing freely. Connect with your partner when you're ready.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-card rounded-xl border shadow-sm overflow-hidden">
                    <DiaryEditor isGuest={true} />
                </div>
            </main>
        </div>
    )
}
