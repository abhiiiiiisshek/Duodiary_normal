



import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InviteSection from './invite-section'
import EntryList from '@/components/entry/entry-list'

export default async function Dashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    let entries = []

    if (profile?.relationship_id) {
        // Fetch entries:
        // 1. My entries (private or not)
        // 2. Partner's entries (not private) - This is handled by RLS policy "Users can read partner's shared entries"
        // So we just select * from entries where relationship_id = my_rel_id ?
        // But better to let RLS filter it.
        // However, for performance we should query efficiently.
        // RLS policy:
        // - user_id = auth.uid() OR (relationship_id = my_rel_id AND is_private = false AND user_id != auth.uid())
        // 
        // If we just query entries, RLS will apply.
        const { data } = await supabase
            .from('entries')
            .select('*')
            .order('created_at', { ascending: false })

        entries = data || []
    }

    return (
        <div className="min-h-screen bg-background p-8 transition-colors duration-300">
            <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{profile?.username || user.email}</span>
                    <form action="/auth/signout" method="post">
                        <button className="text-sm text-destructive hover:underline">
                            Sign Out
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-4xl mx-auto">
                {!profile?.relationship_id ? (
                    <div className="flex justify-center py-12">
                        <InviteSection
                            inviteCode={profile?.invite_code || null}
                            relationshipId={profile?.relationship_id || null}
                        />
                    </div>
                ) : (
                    <EntryList entries={entries} currentUserId={user.id} />
                )}
            </main>
        </div>
    )
}
