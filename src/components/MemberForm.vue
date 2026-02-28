<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMemberStore } from '@/stores/memberStore'
import { supabase } from '@/libs/supabase'
import { X, Upload } from 'lucide-vue-next'
import type { Member, NewMember } from '@/types'

const props = defineProps<{ member?: Member | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const store = useMemberStore()

const isEdit = ref(!!props.member)
const loading = ref(false)
const errorMsg = ref('')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref(props.member?.avatar_url || '')

const form = ref<NewMember>({
  full_name: props.member?.full_name ?? '',
  gender: props.member?.gender ?? 'male',
  birth_date: props.member?.birth_date ?? null,
  death_date: props.member?.death_date ?? null,
  birth_place: props.member?.birth_place ?? null,
  avatar_url: props.member?.avatar_url ?? null,
  bio: props.member?.bio ?? null,
  generation: props.member?.generation ?? 1,
})

watch(() => props.member, (m) => {
  isEdit.value = !!m
  form.value = {
    full_name: m?.full_name ?? '',
    gender: m?.gender ?? 'male',
    birth_date: m?.birth_date ?? null,
    death_date: m?.death_date ?? null,
    birth_place: m?.birth_place ?? null,
    avatar_url: m?.avatar_url ?? null,
    bio: m?.bio ?? null,
    generation: m?.generation ?? 1,
  }
  avatarPreview.value = m?.avatar_url || ''
})

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function uploadAvatar(memberId: string): Promise<string | null> {
  if (!avatarFile.value) return form.value.avatar_url
  const ext = avatarFile.value.name.split('.').pop()
  const path = `${memberId}/avatar.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, avatarFile.value, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

async function handleSubmit() {
  if (!form.value.full_name.trim()) {
    errorMsg.value = 'Vui lòng nhập họ tên.'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    if (isEdit.value && props.member) {
      const avatarUrl = await uploadAvatar(props.member.id)
      await store.updateMember(props.member.id, { ...form.value, avatar_url: avatarUrl })
    } else {
      // Tạo mới, upload avatar sau
      const created = await store.addMember({ ...form.value, avatar_url: null })
      const avatarUrl = await uploadAvatar(created.id)
      if (avatarUrl) {
        await store.updateMember(created.id, { avatar_url: avatarUrl })
      }
    }
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
        <h3>{{ isEdit ? 'Sửa thành viên' : 'Thêm thành viên' }}</h3>
        <button class="icon-btn" @click="emit('close')"><X :size="18" /></button>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Avatar upload -->
        <div class="avatar-upload">
          <div class="avatar-preview">
            <img v-if="avatarPreview" :src="avatarPreview" />
            <span v-else>{{ form.full_name?.[0] || '?' }}</span>
          </div>
          <label class="btn btn-ghost btn-sm" for="avatar-input">
            <Upload :size="14" /> Chọn ảnh
          </label>
          <input id="avatar-input" type="file" accept="image/*" style="display:none" @change="onFileChange" />
        </div>

        <div class="form-row">
          <div class="form-group flex-2">
            <label>Họ và tên *</label>
            <input v-model="form.full_name" class="form-control" placeholder="Nguyễn Văn A" />
          </div>
          <div class="form-group">
            <label>Giới tính</label>
            <select v-model="form.gender" class="form-control">
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Đời thứ</label>
            <input v-model.number="form.generation" type="number" min="1" class="form-control" />
          </div>
          <div class="form-group">
            <label>Ngày sinh</label>
            <input v-model="form.birth_date" type="date" class="form-control" />
          </div>
          <div class="form-group">
            <label>Ngày mất</label>
            <input v-model="form.death_date" type="date" class="form-control" />
          </div>
        </div>

        <div class="form-group">
          <label>Nơi sinh</label>
          <input v-model="form.birth_place" class="form-control" placeholder="Tỉnh / Quê quán" />
        </div>

        <div class="form-group">
          <label>Tiểu sử / Ghi chú</label>
          <textarea v-model="form.bio" class="form-control" rows="3" placeholder="Để trống nếu không có" />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <div class="form-actions">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Hủy</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Đang lưu…' : isEdit ? 'Cập nhật' : 'Thêm mới' }}
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
.modal-box {
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}
.modal-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-primary);
}
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 6px;
}
.icon-btn:hover { background: var(--color-border); }

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.avatar-preview {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: var(--color-border);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--color-muted);
  flex-shrink: 0;
}
.avatar-preview img { width: 100%; height: 100%; object-fit: cover; }

.form-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.form-row .form-group {
  flex: 1;
  min-width: 120px;
}
.form-row .flex-2 { flex: 2; }

.error-msg {
  color: #dc2626;
  font-size: 0.87rem;
  margin-bottom: 0.75rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

textarea.form-control {
  resize: vertical;
}
</style>
