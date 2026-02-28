<script setup lang="ts">
import { computed } from 'vue'
import { useMemberStore } from '@/stores/memberStore'
import FamilyTree from '@/components/FamilyTree.vue'
import MemberCard from '@/components/MemberCard.vue'
import { Users, Search } from 'lucide-vue-next'
import { ref } from 'vue'

const store = useMemberStore()
const search = ref('')

const filteredMembers = computed(() => {
  if (!search.value.trim()) return store.members
  return store.members.filter((m) =>
    m.full_name.toLowerCase().includes(search.value.toLowerCase()),
  )
})

// Số đời tối đa
const maxGen = computed(() =>
  store.members.length ? Math.max(...store.members.map((m) => m.generation)) : 1,
)
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <h1>Gia Phả Dòng Họ Nguyễn Kim</h1>
      <p>Lưu giữ và tôn vinh những thế hệ tiên tổ của dòng họ</p>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-num">{{ store.members.length }}</span>
          <span class="stat-label">Thành viên</span>
        </div>
        <div class="stat">
          <span class="stat-num">{{ maxGen }}</span>
          <span class="stat-label">Thế hệ</span>
        </div>
        <div class="stat">
          <span class="stat-num">{{ store.relationships.length }}</span>
          <span class="stat-label">Mối quan hệ</span>
        </div>
      </div>
    </section>

    <!-- Cây gia phả -->
    <section class="section">
      <div class="section-header">
        <h2>🌳 Cây Gia Phả</h2>
      </div>
      <div class="tree-container">
        <FamilyTree v-if="!store.loading && store.members.length" />
        <div v-else-if="store.loading" class="placeholder">Đang tải…</div>
        <div v-else class="placeholder">Chưa có dữ liệu gia phả.</div>
      </div>
    </section>

    <!-- Danh sách thành viên -->
    <section class="section">
      <div class="section-header">
        <h2><Users :size="20" /> Danh Sách Thành Viên</h2>
        <div class="search-box">
          <Search :size="15" class="search-icon" />
          <input v-model="search" type="text" placeholder="Tìm kiếm…" class="form-control search-input" />
        </div>
      </div>

      <div v-if="store.loading" class="placeholder">Đang tải…</div>
      <div v-else-if="filteredMembers.length" class="member-grid">
        <MemberCard v-for="m in filteredMembers" :key="m.id" :member="m" />
      </div>
      <div v-else class="placeholder">Không tìm thấy thành viên nào.</div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

.hero {
  text-align: center;
  padding: 3rem 1rem;
}
.hero h1 {
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.6rem;
}
.hero p {
  color: var(--color-muted);
  font-size: 1rem;
  margin-bottom: 1.75rem;
}
.hero-stats {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
}
.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}
.stat-label {
  font-size: 0.82rem;
  color: var(--color-muted);
}

.section {
  margin-top: 2.5rem;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text);
}

.tree-container {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  height: 480px;
  background: #fff;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.search-box {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 0.65rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
}
.search-input {
  padding-left: 2rem;
  width: 220px;
}

.placeholder {
  text-align: center;
  padding: 3rem;
  color: var(--color-muted);
}
</style>
