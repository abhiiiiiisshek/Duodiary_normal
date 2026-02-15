'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- INVITE SYSTEM ACTIONS ---

export async function generateInviteCode() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Generate a random 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { error } = await supabase
        .from('profiles')
        .update({ invite_code: code })
        .eq('id', user.id)

    if (error) {
        console.error('Error generating invite code:', error)
        throw new Error('Failed to generate invite code')
    }

    revalidatePath('/dashboard')
}

export async function joinRelationship(code: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Find the user who owns this code
    const { data: targetUser, error: findError } = await supabase
        .from('profiles')
        .select('id, relationship_id')
        .eq('invite_code', code)
        .single()

    if (findError || !targetUser) {
        throw new Error('Invalid invite code')
    }

    if (targetUser.id === user.id) {
        throw new Error('You cannot invite yourself')
    }

    // Check if target user is already in a relationship
    if (targetUser.relationship_id) {
        throw new Error('This user is already in a relationship')
    }

    // Check if current user is already in a relationship
    const { data: currentUser } = await supabase
        .from('profiles')
        .select('relationship_id')
        .eq('id', user.id)
        .single()

    if (currentUser?.relationship_id) {
        throw new Error('You are already in a relationship')
    }

    // Create a new relationship
    const { data: newRel, error: createRelError } = await supabase
        .from('relationships')
        .insert({ status: 'active' })
        .select()
        .single()

    if (createRelError || !newRel) {
        throw new Error('Failed to create relationship')
    }

    // Update both users
    const { error: updateTarget } = await supabase
        .from('profiles')
        .update({ relationship_id: newRel.id, invite_code: null })
        .eq('id', targetUser.id)

    const { error: updateCurrent } = await supabase
        .from('profiles')
        .update({ relationship_id: newRel.id })
        .eq('id', user.id)

    if (updateTarget || updateCurrent) {
        throw new Error('Failed to link users')
    }

    revalidatePath('/dashboard')
}

// --- DIARY CRUD ACTIONS ---

export async function createEntry(content: string = '') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: profile } = await supabase
        .from('profiles')
        .select('relationship_id')
        .eq('id', user.id)
        .single()

    if (!profile?.relationship_id) throw new Error('No relationship found')

    const { data: entry, error } = await supabase
        .from('entries')
        .insert({
            user_id: user.id,
            relationship_id: profile.relationship_id,
            content,
            is_private: false,
            word_count: content.trim() ? content.trim().split(/\s+/).length : 0,
            char_count: content.length
        })
        .select()
        .single()

    if (error) {
        console.error('Create entry error:', error)
        throw new Error('Failed to create entry')
    }

    revalidatePath('/dashboard')
    return entry.id
}

export async function updateEntry(id: string, updates: { content?: string, is_private?: boolean, mood?: string, word_count?: number, char_count?: number }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('entries')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id) // Security check to ensure ownership

    if (error) {
        throw new Error('Failed to save entry')
    }

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/entry/${id}`)
}

export async function deleteEntry(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) throw new Error('Failed to delete entry')

    revalidatePath('/dashboard')
}
