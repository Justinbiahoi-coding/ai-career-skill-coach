---
name: nextjs-app-router
description: >-
  Strict architectural guidelines, performance rules, and best practices for Next.js App Router (v14/v15+).
  Enforces Server vs. Client Component boundaries, async data fetching, granular Suspense streaming,
  type-safe Server Actions with cache invalidation, dynamic metadata/SEO, and Core Web Vitals optimization.
  Activate this skill when designing, reviewing, or generating Next.js App Router code.
---

# Next.js App Router Engineering Skill (Production Standard)

> **Role**: Fullstack Next.js Core Maintainer & Web Performance Architect  
> **Target Framework**: Next.js 14 / 15+ (App Router)  
> **Mission**: Triệt tiêu lỗi kiến trúc, tối ưu Core Web Vitals (LCP, INP, CLS), đảm bảo Type-Safety từ Database tới UI, và tối đa hóa chỉ số SEO.

---

## 1. Server vs. Client Components Architecture

### 1.1. The Golden Rule: Server Components by Default
Mọi component trong thư mục `app/` mặc định là **React Server Component (RSC)**.
* **KHÔNG BAO GIỜ** gắn `'use client'` ở cấp Route (`page.tsx`) hoặc Layout (`layout.tsx`).
* Chỉ khai báo `'use client'` ở các **Leaf Components** (thành phần lá ngoài rìa của cây component) khi và chỉ khi cần:
  1. React Hooks trạng thái / vòng đời: `useState`, `useReducer`, `useEffect`, `useRef`, `useLayoutEffect`.
  2. Browser APIs: `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `matchMedia`.
  3. Event listeners tương tác người dùng: `onClick`, `onChange`, `onSubmit`, `onKeyDown`.
  4. Client-only Context Providers hoặc Animation libraries (Motion, GSAP).

### 1.2. Interleaving & The "Children as Slots" Pattern
Để chèn Server Component (RSC) vào bên trong một Client Component mà **không biến RSC thành Client Component**, bắt buộc sử dụng cơ chế Slot (`children` hoặc named props):

```tsx
// ✅ ĐÚNG: Server Component lồng vào Client Component qua prop 'children'
// components/client-dialog.tsx
'use client';

import { useState } from 'react';

export function ClientDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      {isOpen && <div className="modal-body">{children}</div>}
    </div>
  );
}

// app/page.tsx (RSC)
import { ClientDialog } from '@/components/client-dialog';
import { ServerProductDetails } from '@/components/server-product-details'; // RSC lấy data từ DB

export default function Page() {
  return (
    <ClientDialog>
      <ServerProductDetails /> {/* Giữ nguyên 0KB client JavaScript */}
    </ClientDialog>
  );
}
```

### 1.3. Serialization & Security Boundary
Dữ liệu truyền từ Server Component sang Client Component qua props được serialize bằng React Flight protocol:
* **Không bao giờ** truyền: Functions, class instances, Symbols, Promises (trừ khi dùng `use()` hook của React 19), hoặc un-serializable objects.
* **Tuyệt đối không leak Secrets**: Không truyền nguyên entity database chứa `password_hash`, `stripe_secret_key`, hoặc internal flags sang Client Component. Luôn map qua Data Transfer Object (DTO) hoặc explicit schema trước khi truyền.
* **Server-Only Enforcement**: Đối với các utility truy vấn database hoặc chứa secret keys, bắt buộc thêm package `server-only`:
  ```bash
  npm install server-only
  ```
  ```ts
  // lib/db.ts
  import 'server-only';
  // Nếu vô tình import file này vào Client Component, Next.js build sẽ báo lỗi ngay lập tức.
  ```

---

## 2. Data Fetching & Caching Strategy (Next.js 14/15+)

### 2.1. Direct Fetching trong Server Components
Không sử dụng `useEffect` + `fetch` hoặc React Query cho dữ liệu ban đầu (Initial Data Fetching). Fetch trực tiếp tại Server Component bằng `async/await`.

### 2.2. Next.js 14 vs Next.js 15 Caching Paradigm
* **Next.js 14**: `fetch` mặc định là `force-cache` (Static Data).
* **Next.js 15**: `fetch` mặc định là `no-store` (Dynamic Data), `cookies()`, `headers()`, `params`, và `searchParams` là **Asynchronous Promises** (`await params`).

```tsx
// Cấu hình Caching cho fetch:
// 1. Static Cache vĩnh viễn (SSG-equivalent)
fetch('https://api.example.com/data', { cache: 'force-cache' });

// 2. Time-based Revalidation (ISR-equivalent)
fetch('https://api.example.com/data', { next: { revalidate: 3600 } }); // 1 giờ

// 3. On-demand Tagged Cache (Khuyên dùng nhất cho hệ thống production)
fetch('https://api.example.com/products', { next: { tags: ['products-list'] } });

// 4. Dynamic không cache (Real-time)
fetch('https://api.example.com/live', { cache: 'no-store' });
```

### 2.3. Server Actions & Mutations
* Định nghĩa Server Actions với directive `'use server'`.
* Mọi input từ client phải được validate nghiêm ngặt bằng **Zod**.
* Thực thi xác thực và phân quyền (Auth & RBAC) trực tiếp bên trong Action trước khi thao tác Database.
* Sử dụng `revalidateTag` hoặc `revalidatePath` để làm mới cache tức thì (instant cache purge).

```ts
// app/actions/product-actions.ts
'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

const CreateProductSchema = z.object({
  title: z.string().min(3).max(100),
  price: z.number().positive(),
});

export async function createProductAction(formData: FormData) {
  // 1. Auth Guard
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  // 2. Input Validation
  const validated = CreateProductSchema.safeParse({
    title: formData.get('title'),
    price: Number(formData.get('price')),
  });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  // 3. DB Mutation
  await db.product.create({
    data: {
      ...validated.data,
      userId: session.user.id,
    },
  });

  // 4. On-Demand Revalidation
  revalidateTag('products-list');
  return { success: true };
}
```

---

## 3. Routing, Layouts & Streaming SSR

### 3.1. File System Hierarchy & Conventions
* `layout.tsx`: Quản lý shared UI giữa các trang con (không re-render khi chuyển trang).
* `template.tsx`: Tương tự layout nhưng re-mount và tạo state mới mỗi lần chuyển route (dùng khi cần animation enter/exit hoặc logging page views).
* `loading.tsx`: Tự động bọc `page.tsx` trong một React `<Suspense>` boundary ở cấp cao nhất.
* `error.tsx`: **Bắt buộc phải có `'use client'`**. Xử lý React Error Boundary cho route segment hiện tại.
* `not-found.tsx`: UI hiển thị khi gọi hàm `notFound()`.
* **Route Groups `(folder)`**: Tổ chức mã nguồn hoặc tạo nhiều layout độc lập mà không ảnh hưởng URL path (ví dụ: `(marketing)` và `(dashboard)`).
* **Parallel Routes `@slot` & Intercepting Routes `(.)path`**: Xây dựng modal, feed lồng nhau mà vẫn giữ nguyên URL có thể chia sẻ được.

### 3.2. Granular Suspense Boundaries (Streaming SSR)
**Tuyệt đối không để một truy vấn chậm chặn đứng toàn bộ trang.** Phân tách các phần dữ liệu chậm thành các component độc lập và bao bọc bằng `<Suspense>`:

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { UserMetricsSkeleton, ChartSkeleton } from '@/components/skeletons';
import { FastUserProfile } from '@/components/fast-user-profile';
import { SlowMetrics } from '@/components/slow-metrics';
import { SlowChart } from '@/components/slow-chart';

export default function DashboardPage() {
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Component phản hồi nhanh: render ngay lập tức vào initial HTML */}
      <FastUserProfile />

      {/* Component chậm 1: Stream độc lập khi dữ liệu sẵn sàng */}
      <Suspense fallback={<UserMetricsSkeleton />}>
        <SlowMetrics />
      </Suspense>

      {/* Component chậm 2: Stream độc lập, không đợi SlowMetrics */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />
      </Suspense>
    </main>
  );
}
```

---

## 4. Performance & Metadata (SEO & Core Web Vitals)

### 4.1. Metadata API (SEO Standard)
Không dùng thẻ `<head>` thủ công. Sử dụng Metadata API của Next.js:

```tsx
// 1. Static Metadata
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | AI Career Coach',
    default: 'AI Career Coach - Master Tech Interviews',
  },
  description: 'AI-driven personalized career coaching and mock interviews.',
  metadataBase: new URL('https://aicareercoach.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

// 2. Dynamic Metadata (theo dữ liệu sản phẩm/bài viết)
type PageProps = {
  params: Promise<{ id: string }>; // Lưu ý: Next.js 15 params là Promise
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    return { title: 'Course Not Found' };
  }

  return {
    title: course.title,
    description: course.summary,
    openGraph: {
      title: course.title,
      description: course.summary,
      images: [{ url: course.coverImage }],
    },
  };
}
```

### 4.2. Core Web Vitals & Built-in Optimizations

#### `next/image` (Zero CLS & Optimized LCP)
* Bắt buộc có `alt` rõ nghĩa cho accessibility.
* Với ảnh trên màn hình đầu tiên (Above-The-Fold / Hero Image): **Bắt buộc thêm `priority`**.
* Với ảnh có kích thước responsive (`fill`): **Bắt buộc cung cấp thuộc tính `sizes`** để trình duyệt tải đúng độ phân giải màn hình:
```tsx
<div className="relative w-full aspect-video rounded-xl overflow-hidden">
  <Image
    src="/hero.jpg"
    alt="Platform dashboard preview"
    fill
    priority
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
    className="object-cover"
  />
</div>
```

#### `next/font` (Zero Layout Shift Fonts)
Cấu hình font qua CSS variable trong `app/layout.tsx` để trình duyệt tải font tự lưu trữ (self-hosted), loại bỏ hoàn toàn hiện tượng Flash of Unstyled Text (FOUT):
```tsx
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

#### `next/link`
* Tự động prefetch các route được link tới trong viewport.
* Với dynamic routing lớn, cân nhắc `prefetch={false}` nếu route đó chứa quá nhiều dữ liệu nặng không cần thiết tải trước.

---

## 5. Architectural Anti-Patterns (Cấm Tuyệt Đối)

| Anti-Pattern | Lý do nguy hại | Giải pháp chuẩn mực |
| :--- | :--- | :--- |
| **`'use client'` ở `page.tsx`** | Vô hiệu hóa SSR streaming, làm phình to Client Bundle JS, phá hỏng SEO. | Giữ `page.tsx` là Server Component, chỉ tách các nút bấm/form nhỏ ra file riêng có `'use client'`. |
| **`useState` + `useEffect` fetch dữ liệu** | Gây Waterfall requests, giật layout (layout shift), trang trắng khi JS chưa tải xong. | Fetch trực tiếp bằng `await` trong Server Component và bọc `<Suspense>`. |
| **Import DB/Secret vào Client** | Rò rỉ credential, API keys bí mật vào file JS trên trình duyệt người dùng. | Dùng `import 'server-only'` trong module nhạy cảm; chỉ giao tiếp qua Server Actions hoặc Route Handlers. |
| **Không dùng `sizes` khi có `fill` trong `<Image />`** | Trình duyệt tải ảnh kích thước 100vw trên mọi thiết bị (kể cả mobile), gây suy giảm chỉ số LCP. | Luôn khai báo `sizes="(max-width: ...) ..."` tương ứng với layout CSS. |
| **Quên `mode="popLayout"` / `key` trong Motion** | Component biến mất giật cục hoặc layout bị nhảy vọt khi unmount. | Kết hợp `<AnimatePresence>` đúng cách với `key` duy nhất và khai báo CSS transforms thay vì animate `height`. |
| **Dùng `params` đồng bộ trong Next.js 15** | Gây cảnh báo hoặc lỗi runtime trong các phiên bản Next.js mới. | Luôn khai báo `const { slug } = await params;`. |

---

## 6. AI Agent Pre-flight Checklist

Trước khi xuất bất kỳ đoạn mã Next.js nào, Agent **bắt buộc** đối chiếu danh sách sau:

1. [ ] **Component Boundary**: File này có thể giữ làm Server Component không? Nếu có hooks, component này đã được cô lập ở mức nhỏ nhất (leaf node) chưa?
2. [ ] **Data Fetching**: Dữ liệu có được fetch ở Server Component không? Đã cấu hình `revalidate`, `tags`, hoặc `cache` chính xác chưa?
3. [ ] **Streaming & Suspense**: Các promise hoặc DB queries tốn thời gian đã được bọc trong `<Suspense fallback={<Skeleton />}>` chưa?
4. [ ] **Security**: Có API token, database instance, hay thông tin nhạy cảm nào bị truyền qua Client Component props không?
5. [ ] **Image & Assets**: Mọi thẻ `<Image />` đã có `alt`, `sizes` (nếu dùng `fill`), và `priority` (nếu là LCP / Hero image) chưa?
6. [ ] **Metadata**: Trang đã có `export const metadata` hoặc `generateMetadata` đầy đủ title, description và OpenGraph chưa?
