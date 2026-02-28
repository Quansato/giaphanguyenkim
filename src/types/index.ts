export interface Member {
    id: string
    full_name: string
    gender: 'male' | 'female' | null
    birth_date: string | null
    death_date: string | null
    birth_place: string | null
    avatar_url: string | null
    bio: string | null
    generation: number
    created_at: string
    updated_at: string
}

export type NewMember = Omit<Member, 'id' | 'created_at' | 'updated_at'>

export interface Relationship {
    id: string
    from_member_id: string
    to_member_id: string
    relation_type: 'parent' | 'spouse'
    created_at: string
}

export type NewRelationship = Omit<Relationship, 'id' | 'created_at'>
