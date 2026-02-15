import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DiaryEditor from '@/components/entry/diary-editor'

export default async function EntryPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: entry, error } = await supabase
        .from('entries')
        .select('*')
        .eq('id', params.id)
        .single()

    if (error || !entry) {
        return redirect('/dashboard')
    }

    // Check access: Must be own entry or partner's (if shared)
    // But for EDITING, only own entry is allowed.
    if (entry.user_id !== user.id) {
        // If it's a partner viewing, maybe show a read-only view?
        // For now, redirect or show error since this is Editor page.
        // Use generic "Read Only" component if needed, but for now strict ownership for edit.
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Read Entry</h1>
                <div className="mt-4 p-4 border rounded bg-card">
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <DiaryEditor entry={entry} />
        </div>
    )
}
