<script setup lang="ts">
import { ref } from 'vue'
import { useMemberStore } from '@/stores/memberStore'
import { X } from 'lucide-vue-next'

const emit = defineEmits<{ (e: 'close'): void }>()
const store = useMemberStore()

const fromId = ref('')
const toId = ref('')
const relType = ref<'parent' | 'spouse'>('parent')
const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  if (!fromId.value || !toId.value) {
    errorMsg.value = 'Vui lòng chọn cả hai thành viên.'
    return
  }
  if (fromId.value === toId.value) {
    errorMsg.value = 'Hai thành viên phải khác nhau.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await store.addRelationship({
      from_member_id: fromId.value,
      to_member_id: toId.value,
      relation_type: relType.value,
    })
    emit('close')
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box card">
      <div class="modal-header">
        <h3>Thêm mối quan hệ</h3>
        <button class="icon-btn" @click="emit('close')"><X :size="18" /></button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Loại quan hệ</label>
          <select v-model="relType" class="form-control">
            <option value="parent">Cha/Mẹ → Con (parent)</option>
            <option value="spouse">Vợ/Chồng (spouse)</option>
          </select>
        </div>

        <div class="rel-row">
          <div class="form-group">
            <label>{{ relType === 'parent' ? 'Cha / Mẹ' : 'Thành viên 1' }}</label>
            <select v-model="fromId" class="form-control">
              <option value="">-- Chọn --</option>
              <option v-for="m in store.members" :key="m.id" :value="m.id">
                {{ m.full_name }} (Đ{{ m.generation }})
              </option>
            </select>
          </div>

          <div class="arrow">→</div>

          <div class="form-group">
            <label>{{ relType === 'parent' ? 'Con' : 'Thành viên 2' }}</label>
            <select v-model="toId" class="form-control">
              <option value="">-- Chọn --</option>
              <option v-for="m in store.members" :key="m.id" :value="m.id">
                {{ m.full_name }} (Đ{{ m.generation }})
              </option>
            </select>
          </div>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <div class="form-actions">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Hủy</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Đang lưu…' : 'Lưu quan hệ' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}
.modal-box { width: 100%; max-width: 500px; }
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}
.modal-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--color-primary); }
.icon-btn {
  background: none; border: none; cursor: pointer; color: var(--color-muted);
  display: flex; align-items: center; padding: 0.25rem; border-radius: 6px;
}
.icon-btn:hover { background: var(--color-border); }

.rel-row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}
.rel-row .form-group { flex: 1; }
.arrow {
  font-size: 1.4rem;
  padding-bottom: 0.6rem;
  color: var(--color-primary);
  font-weight: 700;
}

.error-msg { color: #dc2626; font-size: 0.87rem; margin-bottom: 0.75rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
</style>
