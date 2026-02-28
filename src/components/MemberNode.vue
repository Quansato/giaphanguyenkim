<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { Member } from '@/types'
import { User } from 'lucide-vue-next'

const props = defineProps<{ data: { member: Member } }>()
const m = props.data.member
</script>

<template>
  <div class="member-node" :class="{ deceased: m.death_date }">
    <Handle type="target" :position="Position.Top" />

    <div class="node-avatar">
      <img v-if="m.avatar_url" :src="m.avatar_url" />
      <User v-else :size="20" />
    </div>
    <div class="node-info">
      <div class="node-name">{{ m.full_name }}</div>
      <div class="node-meta">
        <span class="gen-tag">Đ{{ m.generation }}</span>
        <span v-if="m.birth_date">{{ m.birth_date.slice(0, 4) }}</span>
        <span v-if="m.death_date">†{{ m.death_date.slice(0, 4) }}</span>
      </div>
    </div>

    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.member-node {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 2px solid #e8d9c0;
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  width: 150px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: box-shadow 0.15s, transform 0.15s;
}
.member-node:hover {
  box-shadow: 0 6px 18px rgba(200,134,10,0.2);
  transform: translateY(-2px);
}
.member-node.deceased {
  border-color: #d1d5db;
  background: #f9f9f9;
}

.node-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: #fdf0d5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #c8860a;
}
.node-avatar img { width: 100%; height: 100%; object-fit: cover; }

.node-info { overflow: hidden; }
.node-name {
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2c1a0e;
}
.node-meta {
  display: flex;
  gap: 0.3rem;
  font-size: 0.68rem;
  color: #7a6350;
  margin-top: 0.15rem;
  flex-wrap: wrap;
}
.gen-tag {
  background: #fde68a;
  color: #92400e;
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
  font-weight: 700;
}
</style>
