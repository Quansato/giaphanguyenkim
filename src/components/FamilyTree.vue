<script setup lang="ts">
import { computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
import type { NodeMouseEvent } from '@vue-flow/core'
import { useMemberStore } from '@/stores/memberStore'
import { useRouter } from 'vue-router'
import MemberNode from './MemberNode.vue'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const store = useMemberStore()
const router = useRouter()

const GEN_GAP_Y = 160
const NODE_GAP_X = 200

// Tính toán layout: nhóm theo generation, sắp xếp theo thứ tự
const nodes = computed(() => {
  const genMap = new Map<number, typeof store.members>()
  for (const m of store.members) {
    if (!genMap.has(m.generation)) genMap.set(m.generation, [])
    genMap.get(m.generation)!.push(m)
  }

  const result: any[] = []
  for (const [gen, members] of genMap.entries()) {
    const totalW = members.length * NODE_GAP_X
    const startX = -totalW / 2
    members.forEach((m, i) => {
      result.push({
        id: m.id,
        type: 'memberNode',
        position: { x: startX + i * NODE_GAP_X, y: (gen - 1) * GEN_GAP_Y },
        data: { member: m },
      })
    })
  }
  return result
})

const edges = computed(() =>
  store.relationships.map((r) => ({
    id: r.id,
    source: r.from_member_id,
    target: r.to_member_id,
    type: r.relation_type === 'spouse' ? 'straight' : 'smoothstep',
    style: r.relation_type === 'spouse'
      ? { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,4' }
      : { stroke: '#c8860a', strokeWidth: 2 },
    animated: false,
  })),
)

function onNodeClick({ node }: NodeMouseEvent) {
  router.push(`/member/${node.id}`)
}
</script>

<template>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    :node-types="{ memberNode: MemberNode as any }"
    fit-view-on-init
    :min-zoom="0.3"
    :max-zoom="2"
    class="family-flow"
    @node-click="onNodeClick"
  >
    <template #background>
      <div class="flow-bg" />
    </template>
  </VueFlow>
</template>

<style>
.family-flow {
  width: 100%;
  height: 100%;
  background: #fdf8f0;
}
.vue-flow__node {
  cursor: pointer;
}
</style>
