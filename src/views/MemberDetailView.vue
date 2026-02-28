<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMemberStore } from '@/stores/memberStore'
import { ArrowLeft, User, MapPin, Calendar } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useMemberStore()

const member = computed(() => store.getMemberById(route.params.id as string))
const parents = computed(() => (member.value ? store.getParentsOf(member.value.id) : []))
const children = computed(() => (member.value ? store.getChildrenOf(member.value.id) : []))
const spouses = computed(() => (member.value ? store.getSpouseOf(member.value.id) : []))

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="detail-page">
    <button class="btn btn-ghost back-btn" @click="router.back()">
      <ArrowLeft :size="16" /> Quay lại
    </button>

    <div v-if="member" class="detail-content">
      <!-- Avatar & Info -->
      <div class="profile-header card">
        <div class="avatar-wrap">
          <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.full_name" class="avatar" />
          <div v-else class="avatar-placeholder">
            <User :size="40" />
          </div>
        </div>
        <div class="profile-info">
          <h1>{{ member.full_name }}</h1>
          <span class="badge" :class="member.gender === 'male' ? 'badge-male' : 'badge-female'">
            {{ member.gender === 'male' ? '♂ Nam' : '♀ Nữ' }}
          </span>
          <span class="generation-badge">Đời thứ {{ member.generation }}</span>

          <div class="meta-list">
            <div class="meta-item" v-if="member.birth_date || member.death_date">
              <Calendar :size="15" />
              <span>
                {{ formatDate(member.birth_date) }}
                <template v-if="member.death_date"> — {{ formatDate(member.death_date) }}</template>
              </span>
            </div>
            <div class="meta-item" v-if="member.birth_place">
              <MapPin :size="15" />
              <span>{{ member.birth_place }}</span>
            </div>
          </div>

          <p v-if="member.bio" class="bio">{{ member.bio }}</p>
        </div>
      </div>

      <!-- Relations -->
      <div class="relations-grid">
        <div v-if="parents.length" class="card relation-group">
          <h3>Cha / Mẹ</h3>
          <router-link v-for="p in parents" :key="p.id" :to="`/member/${p.id}`" class="relation-item">
            {{ p.full_name }} <small>(đời {{ p.generation }})</small>
          </router-link>
        </div>

        <div v-if="spouses.length" class="card relation-group">
          <h3>Vợ / Chồng</h3>
          <router-link v-for="s in spouses" :key="s.id" :to="`/member/${s.id}`" class="relation-item">
            {{ s.full_name }}
          </router-link>
        </div>

        <div v-if="children.length" class="card relation-group">
          <h3>Con cái</h3>
          <router-link v-for="c in children" :key="c.id" :to="`/member/${c.id}`" class="relation-item">
            {{ c.full_name }} <small>(đời {{ c.generation }})</small>
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="not-found card">
      Không tìm thấy thành viên này.
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
}
.back-btn { margin-bottom: 1.25rem; }

.profile-header {
  display: flex;
  gap: 1.75rem;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.avatar-wrap { flex-shrink: 0; }
.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-border);
}
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
}

.profile-info h1 {
  font-size: 1.65rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.generation-badge {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.78rem;
  background: #fef3c7;
  color: #92400e;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-weight: 600;
}
.meta-list {
  margin-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-muted);
  font-size: 0.9rem;
}
.bio {
  margin-top: 0.85rem;
  color: var(--color-muted);
  line-height: 1.6;
  font-size: 0.92rem;
}

.relations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.relation-group h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-muted);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.relation-item {
  display: block;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background: var(--color-bg);
  margin-bottom: 0.4rem;
  font-weight: 500;
  transition: background 0.15s;
}
.relation-item:hover { background: var(--color-border); }
.relation-item small { color: var(--color-muted); font-weight: 400; }

.not-found {
  text-align: center;
  padding: 3rem;
  color: var(--color-muted);
}
</style>
