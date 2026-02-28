<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMemberStore } from '@/stores/memberStore'
import { useAuthStore } from '@/stores/authStore'
import { Plus, Pencil, Trash2, Link } from 'lucide-vue-next'
import MemberForm from '@/components/MemberForm.vue'
import RelationshipForm from '@/components/RelationshipForm.vue'
import type { Member } from '@/types'

const store = useMemberStore()
const auth = useAuthStore()

const showMemberForm = ref(false)
const editingMember = ref<Member | null>(null)
const showRelForm = ref(false)
const deleteConfirmId = ref<string | null>(null)

function openAdd() {
  editingMember.value = null
  showMemberForm.value = true
}
function openEdit(m: Member) {
  editingMember.value = m
  showMemberForm.value = true
}
function closeMemberForm() {
  showMemberForm.value = false
  editingMember.value = null
}
async function confirmDelete(id: string) {
  await store.deleteMember(id)
  deleteConfirmId.value = null
}

const groupedByGen = computed(() => {
  const map = new Map<number, Member[]>()
  for (const m of store.members) {
    if (!map.has(m.generation)) map.set(m.generation, [])
    map.get(m.generation)!.push(m)
  }
  return Array.from(map.entries()).sort(([a], [b]) => a - b)
})
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <div>
        <h1>Quản lý Gia Phả</h1>
        <p class="sub">Đang đăng nhập: <strong>{{ auth.session?.user.email }}</strong></p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost" @click="showRelForm = true">
          <Link :size="16" /> Thêm quan hệ
        </button>
        <button class="btn btn-primary" @click="openAdd">
          <Plus :size="16" /> Thêm thành viên
        </button>
      </div>
    </div>

    <!-- Thống kê -->
    <div class="stats-row">
      <div class="stat-card card">
        <span class="stat-num">{{ store.members.length }}</span>
        <span class="stat-label">Thành viên</span>
      </div>
      <div class="stat-card card">
        <span class="stat-num">{{ store.relationships.length }}</span>
        <span class="stat-label">Mối quan hệ</span>
      </div>
    </div>

    <!-- Danh sách theo đời -->
    <div v-for="[gen, members] in groupedByGen" :key="gen" class="gen-group">
      <h2 class="gen-title">Đời thứ {{ gen }}</h2>
      <div class="admin-table-wrap card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Giới tính</th>
              <th>Năm sinh</th>
              <th>Năm mất</th>
              <th>Nơi sinh</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in members" :key="m.id">
              <td>
                <div class="member-name">
                  <img v-if="m.avatar_url" :src="m.avatar_url" class="table-avatar" />
                  <span v-else class="table-avatar-ph">{{m.full_name[0]}}</span>
                  <span>{{ m.full_name }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="m.gender === 'male' ? 'badge-male' : 'badge-female'">
                  {{ m.gender === 'male' ? 'Nam' : 'Nữ' }}
                </span>
              </td>
              <td>{{ m.birth_date ? m.birth_date.slice(0, 4) : '—' }}</td>
              <td>{{ m.death_date ? m.death_date.slice(0, 4) : '—' }}</td>
              <td>{{ m.birth_place || '—' }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-ghost btn-sm" @click="openEdit(m)">
                    <Pencil :size="14" />
                  </button>
                  <button
                    class="btn btn-danger btn-sm"
                    @click="deleteConfirmId = m.id"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="!store.members.length && !store.loading" class="empty-state card">
      Chưa có thành viên nào. Nhấn "Thêm thành viên" để bắt đầu.
    </div>

    <!-- Modal xác nhận xóa -->
    <div v-if="deleteConfirmId" class="modal-overlay" @click.self="deleteConfirmId = null">
      <div class="modal-box card">
        <h3>Xác nhận xóa</h3>
        <p>Bạn có chắc muốn xóa thành viên này? Tất cả mối quan hệ liên quan cũng sẽ bị xóa.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="deleteConfirmId = null">Hủy</button>
          <button class="btn btn-danger" @click="confirmDelete(deleteConfirmId!)">Xóa</button>
        </div>
      </div>
    </div>

    <!-- Form thêm/sửa thành viên -->
    <MemberForm
      v-if="showMemberForm"
      :member="editingMember"
      @close="closeMemberForm"
    />

    <!-- Form thêm quan hệ -->
    <RelationshipForm
      v-if="showRelForm"
      @close="showRelForm = false"
    />
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.75rem 1.5rem 3rem;
}

.admin-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.admin-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}
.sub {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin-top: 0.2rem;
}
.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stats-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.75rem;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 2rem;
  min-width: 120px;
}
.stat-num { font-size: 2rem; font-weight: 700; color: var(--color-primary); }
.stat-label { font-size: 0.82rem; color: var(--color-muted); }

.gen-group { margin-bottom: 1.5rem; }
.gen-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-muted);
  margin-bottom: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.admin-table-wrap { padding: 0; overflow: auto; }
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.admin-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-muted);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.admin-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
}
.admin-table tr:last-child td { border-bottom: none; }

.member-name {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 500;
}
.table-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.table-avatar-ph {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--color-muted);
  flex-shrink: 0;
}

.row-actions { display: flex; gap: 0.4rem; }
.btn-sm { padding: 0.3rem 0.55rem; }

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-muted);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}
.modal-box {
  max-width: 420px;
  width: 100%;
}
.modal-box h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: #dc2626;
}
.modal-box p {
  font-size: 0.9rem;
  color: var(--color-muted);
  margin-bottom: 1.25rem;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>
