# 📜 System Design — Gia Phả Nguyễn Kim

> **Stack:** Vue 3 + TypeScript · Vite · TailwindCSS 4 · Supabase (Auth + Database) · Vue Flow

---

## 1. Tổng quan hệ thống

Ứng dụng **Gia Phả Nguyễn Kim** là nền tảng web cho phép:

- **Khách (public):** xem cây gia phả, thông tin thành viên mà **không cần đăng nhập**.
- **Admin (1 tài khoản):** đăng nhập để **thêm / sửa / xóa** thành viên và mối quan hệ.

---

## 2. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER CLIENT                    │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Vue     │  │ Vue      │  │  Pinia Stores      │ │
│  │  Router  │  │ Flow     │  │  - authStore       │ │
│  │          │  │ (tree)   │  │  - memberStore     │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │         Supabase JS Client (SDK v2)              ││
│  └──────────────────────────────────────────────────┘│
└─────────────────────────────┬───────────────────────┘
                              │ HTTPS / WebSocket
┌─────────────────────────────▼───────────────────────┐
│                   SUPABASE CLOUD                     │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Auth        │  │  PostgreSQL  │  │  Storage  │  │
│  │  (email/pw)  │  │  (database)  │  │  (ảnh)    │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 3. Database Schema (PostgreSQL / Supabase)

### Bảng `members` — Thành viên trong gia phả

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | `uuid` (PK, default gen) | ID duy nhất |
| `full_name` | `text` NOT NULL | Họ và tên |
| `gender` | `text` (`male`/`female`) | Giới tính |
| `birth_date` | `date` | Ngày sinh |
| `death_date` | `date` | Ngày mất (null = còn sống) |
| `birth_place` | `text` | Nơi sinh |
| `avatar_url` | `text` | URL ảnh (Supabase Storage) |
| `bio` | `text` | Tiểu sử / ghi chú |
| `generation` | `integer` | Đời thứ (1, 2, 3…) |
| `created_at` | `timestamptz` | Thời điểm tạo |
| `updated_at` | `timestamptz` | Thời điểm cập nhật |

### Bảng `relationships` — Quan hệ giữa thành viên

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | `uuid` (PK) | ID duy nhất |
| `from_member_id` | `uuid` FK → `members.id` | Thành viên nguồn |
| `to_member_id` | `uuid` FK → `members.id` | Thành viên đích |
| `relation_type` | `text` | `parent`, `spouse` |
| `created_at` | `timestamptz` | Thời điểm tạo |

> **Lưu ý:** Quan hệ `parent → child` được suy ra từ `relation_type = 'parent'` (from = cha/mẹ, to = con).

### Row Level Security (RLS)

| Bảng | SELECT | INSERT / UPDATE / DELETE |
|------|--------|--------------------------|
| `members` | ✅ Public (anon) | 🔒 Chỉ authenticated |
| `relationships` | ✅ Public (anon) | 🔒 Chỉ authenticated |

```sql
-- Ví dụ RLS cho bảng members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Mọi người đều xem được
CREATE POLICY "public_read" ON members
  FOR SELECT USING (true);

-- Chỉ user đã đăng nhập mới được thêm/sửa/xóa
CREATE POLICY "auth_write" ON members
  FOR ALL USING (auth.role() = 'authenticated');
```

---

## 4. Authentication

- **Phương thức:** Email + Password (Supabase Auth)
- **Chỉ 1 tài khoản admin** — tạo thủ công trong Supabase Dashboard
- **Session** lưu trong `localStorage` (mặc định Supabase SDK)

### Luồng đăng nhập

```
[Admin] → /login → nhập email/pass
         → supabase.auth.signInWithPassword()
         → session được lưu
         → redirect → /admin hoặc /
```

---

## 5. Cấu trúc thư mục `src/`

```
src/
├── main.ts                  # Khởi tạo Vue app, router, pinia
├── App.vue                  # Root component
│
├── libs/
│   └── supabase.ts          # Supabase client singleton
│
├── routers/
│   └── index.ts             # Vue Router: routes, navigation guard
│
├── stores/
│   ├── authStore.ts         # Pinia: trạng thái đăng nhập
│   └── memberStore.ts       # Pinia: danh sách members, relationships
│
├── views/
│   ├── HomeView.vue         # Trang chủ + cây gia phả (public)
│   ├── MemberDetailView.vue # Chi tiết 1 thành viên (public)
│   ├── LoginView.vue        # Trang đăng nhập admin
│   └── AdminView.vue        # Trang quản lý (protected)
│
└── components/
    ├── FamilyTree.vue        # Vue Flow: render cây gia phả
    ├── MemberNode.vue        # Custom node trong cây
    ├── MemberCard.vue        # Card hiển thị thông tin thành viên
    ├── MemberForm.vue        # Form thêm / sửa thành viên
    └── Navbar.vue            # Thanh điều hướng
```

---

## 6. Routing

| Route | Component | Bảo vệ |
|-------|-----------|--------|
| `/` | `HomeView` | Public |
| `/member/:id` | `MemberDetailView` | Public |
| `/login` | `LoginView` | Public (redirect nếu đã login) |
| `/admin` | `AdminView` | 🔒 Yêu cầu auth (navigation guard) |

### Navigation Guard

```typescript
// routers/index.ts
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/login'
  }
})
```

---

## 7. Pinia Stores

### `authStore`

```typescript
// Trạng thái
session: Session | null
isLoggedIn: boolean

// Actions
login(email, password)   // supabase.auth.signInWithPassword
logout()                  // supabase.auth.signOut
initAuth()                // lắng nghe onAuthStateChange
```

### `memberStore`

```typescript
// Trạng thái
members: Member[]
relationships: Relationship[]
loading: boolean

// Actions
fetchAll()                        // SELECT * FROM members + relationships
addMember(data)                   // INSERT INTO members
updateMember(id, data)            // UPDATE members
deleteMember(id)                  // DELETE FROM members (cascade relationships)
addRelationship(from, to, type)   // INSERT INTO relationships
deleteRelationship(id)            // DELETE FROM relationships
```

---

## 8. Cây Gia Phả (Vue Flow)

Vue Flow render cây theo dạng **directed graph**:

- **Node:** Mỗi `Member` = 1 node (component `MemberNode.vue`)
- **Edge:** Mỗi `Relationship` = 1 edge
  - `parent` → đường thẳng đứng (cha/mẹ → con)
  - `spouse` → đường ngang (vợ/chồng)
- **Auto-layout:** Tính toán vị trí (x, y) dựa theo `generation`

```
Đời 1:      [Cụ A] ─── [Cụ B]
                  |
         ┌────────┴─────────┐
Đời 2:  [Con C] ─── [Con D] [Con E]
                   |
Đời 3:          [Cháu F]
```

---

## 9. Luồng dữ liệu chính

```
Supabase DB
    │
    ▼ fetchAll() khi app khởi động
memberStore (Pinia)
    │
    ├──▶ FamilyTree.vue  →  Vue Flow nodes/edges
    │
    └──▶ MemberDetailView.vue  →  hiển thị chi tiết
    
Admin action (thêm/sửa/xóa)
    │
    ▼ gọi store action
memberStore  →  Supabase DB  →  cập nhật local state
```

---

## 10. Supabase Storage (Ảnh thành viên)

- **Bucket:** `avatars` (public bucket)
- Upload ảnh khi tạo/sửa thành viên → lưu URL vào `members.avatar_url`
- Đường dẫn: `avatars/{member_id}/avatar.{ext}`

---

## 11. Kế hoạch triển khai

| Bước | Công việc |
|------|-----------|
| 1 | Tạo tables + RLS trên Supabase Dashboard |
| 2 | Tạo storage bucket `avatars` |
| 3 | Tạo 1 tài khoản admin qua Supabase Auth |
| 4 | Cấu hình `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) |
| 5 | Implement `authStore` + `memberStore` (Pinia) |
| 6 | Implement Router + Navigation Guard |
| 7 | Xây dựng Views: Home, Login, Admin, Detail |
| 8 | Xây dựng `FamilyTree.vue` với Vue Flow |
| 9 | Build & Deploy (Vercel / Netlify) |

---

## 12. SQL — Khởi tạo Database

```sql
-- Tạo bảng members
CREATE TABLE public.members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text NOT NULL,
  gender      text CHECK (gender IN ('male', 'female')),
  birth_date  date,
  death_date  date,
  birth_place text,
  avatar_url  text,
  bio         text,
  generation  integer DEFAULT 1,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Tạo bảng relationships
CREATE TABLE public.relationships (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
  to_member_id   uuid REFERENCES public.members(id) ON DELETE CASCADE,
  relation_type  text CHECK (relation_type IN ('parent', 'spouse')),
  created_at     timestamptz DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- Policy: đọc công khai
CREATE POLICY "allow_public_read_members" ON public.members
  FOR SELECT USING (true);

CREATE POLICY "allow_public_read_relationships" ON public.relationships
  FOR SELECT USING (true);

-- Policy: chỉ authenticated user mới ghi được
CREATE POLICY "allow_auth_write_members" ON public.members
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "allow_auth_write_relationships" ON public.relationships
  FOR ALL USING (auth.role() = 'authenticated');

-- Tự cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

*Cập nhật lần cuối: 2026-02-28*
