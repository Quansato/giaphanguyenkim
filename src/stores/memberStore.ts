import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/libs/supabase'
import type { Member, NewMember, Relationship, NewRelationship } from '@/types'

export const useMemberStore = defineStore('member', () => {
    const members = ref<Member[]>([])
    const relationships = ref<Relationship[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchAll() {
        loading.value = true
        error.value = null
        try {
            const [membersRes, relRes] = await Promise.all([
                supabase.from('members').select('*').order('generation').order('full_name'),
                supabase.from('relationships').select('*'),
            ])
            if (membersRes.error) throw membersRes.error
            if (relRes.error) throw relRes.error
            members.value = membersRes.data as Member[]
            relationships.value = relRes.data as Relationship[]
        } catch (e: any) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    async function addMember(data: NewMember): Promise<Member> {
        const { data: created, error: err } = await supabase
            .from('members')
            .insert(data)
            .select()
            .single()
        if (err) throw err
        members.value.push(created as Member)
        return created as Member
    }

    async function updateMember(id: string, data: Partial<NewMember>) {
        const { data: updated, error: err } = await supabase
            .from('members')
            .update(data)
            .eq('id', id)
            .select()
            .single()
        if (err) throw err
        const idx = members.value.findIndex((m) => m.id === id)
        if (idx !== -1) members.value[idx] = updated as Member
    }

    async function deleteMember(id: string) {
        const { error: err } = await supabase.from('members').delete().eq('id', id)
        if (err) throw err
        members.value = members.value.filter((m) => m.id !== id)
        relationships.value = relationships.value.filter(
            (r) => r.from_member_id !== id && r.to_member_id !== id,
        )
    }

    async function addRelationship(data: NewRelationship): Promise<Relationship> {
        const { data: created, error: err } = await supabase
            .from('relationships')
            .insert(data)
            .select()
            .single()
        if (err) throw err
        relationships.value.push(created as Relationship)
        return created as Relationship
    }

    async function deleteRelationship(id: string) {
        const { error: err } = await supabase.from('relationships').delete().eq('id', id)
        if (err) throw err
        relationships.value = relationships.value.filter((r) => r.id !== id)
    }

    function getMemberById(id: string): Member | undefined {
        return members.value.find((m) => m.id === id)
    }

    function getChildrenOf(memberId: string): Member[] {
        const childIds = relationships.value
            .filter((r) => r.relation_type === 'parent' && r.from_member_id === memberId)
            .map((r) => r.to_member_id)
        return members.value.filter((m) => childIds.includes(m.id))
    }

    function getParentsOf(memberId: string): Member[] {
        const parentIds = relationships.value
            .filter((r) => r.relation_type === 'parent' && r.to_member_id === memberId)
            .map((r) => r.from_member_id)
        return members.value.filter((m) => parentIds.includes(m.id))
    }

    function getSpouseOf(memberId: string): Member[] {
        const spouseIds = relationships.value
            .filter(
                (r) =>
                    r.relation_type === 'spouse' &&
                    (r.from_member_id === memberId || r.to_member_id === memberId),
            )
            .map((r) => (r.from_member_id === memberId ? r.to_member_id : r.from_member_id))
        return members.value.filter((m) => spouseIds.includes(m.id))
    }

    return {
        members,
        relationships,
        loading,
        error,
        fetchAll,
        addMember,
        updateMember,
        deleteMember,
        addRelationship,
        deleteRelationship,
        getMemberById,
        getChildrenOf,
        getParentsOf,
        getSpouseOf,
    }
})
