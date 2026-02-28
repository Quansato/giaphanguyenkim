<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Member } from '@/types'
import { User, Calendar } from 'lucide-vue-next'

const props = defineProps<{ member: Member }>()
</script>

<template>
  <RouterLink :to="`/member/${member.id}`" class="member-card">
    <div class="card-avatar">
      <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.full_name" />
      <div v-else class="avatar-ph">
        <User :size="24" />
      </div>
      <span class="gen-dot">Đ{{ member.generation }}</span>
    </div>
    <div class="card-body">
      <h3>{{ member.full_name }}</h3>
      <span class="badge" :class="member.gender === 'male' ? 'badge-male' : 'badge-female'">
        {{ member.gender === 'male' ? 'Nam' : 'Nữ' }}
      </span>
      <div v-if="member.birth_date" class="card-meta">
        <Calendar :size="13" />
        {{ member.birth_date.slice(0, 4) }}
        <template v-if="member.death_date"> — {{ member.death_date.slice(0, 4) }}</template>
      </div>
      <div v-if="member.birth_place" class="card-place">{{ member.birth_place }}</div>
    </div>
  </RouterLink>
</template>

<style scoped>
.member-card {
  display: block;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  transition: transform 0.18s, box-shadow 0.18s;
  cursor: pointer;
}
.member-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.card-avatar {
  position: relative;
  height: 100px;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-ph {
  color: var(--color-muted);
}
.gen-dot {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
}

.card-body {
  padding: 0.85rem 1rem;
}
.card-body h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: var(--color-text);
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--color-muted);
  margin-top: 0.35rem;
}
.card-place {
  font-size: 0.78rem;
  color: var(--color-muted);
  margin-top: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
