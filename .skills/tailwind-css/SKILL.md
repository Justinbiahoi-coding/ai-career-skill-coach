---
name: tailwind-css
description: >-
  Architectural guidelines, design system tokens, responsive patterns, and clean code standards for Tailwind CSS (v3 & v4).
  Enforces systematic class ordering, mobile-first design, modern state selectors (group, peer, :has),
  component variance authority (CVA), dark mode theming, and strict elimination of @apply abuse.
  Use this skill whenever designing, authoring, or refactoring UI components and styling with Tailwind CSS.
---

# Tailwind CSS Engineering Skill (Design System & Scalable UI)

> **Role**: Principal Design Technologist & UI/UX Systems Architect  
> **Target Framework**: Tailwind CSS (v3 & modern v4 with `@theme`) + React / Next.js  
> **Mission**: Xây dựng giao diện tinh tế, hiện đại (modern aesthetics), có khả năng mở rộng (scalable), dễ bảo trì và tối ưu dung lượng CSS bundle tối đa.

---

## 1. Design System & Token Architecture

### 1.1. Tokenization: Semantic Tokens over Hardcoded Hex
Tuyệt đối không rải rác các mã màu hex ngẫu nhiên (`#3b82f6`, `#1e293b`) trong code. Mọi màu sắc và kích thước phải tuân theo hệ thống Design Token có ngữ nghĩa (Semantic Tokens):

* **Tailwind v4 (CSS-first config với `@theme`)**:
  ```css
  /* app/globals.css */
  @import "tailwindcss";

  @theme {
    --color-background: oklch(0.98 0 0);
    --color-foreground: oklch(0.14 0.01 260);
    --color-primary: oklch(0.55 0.22 260);
    --color-primary-hover: oklch(0.48 0.22 260);
    --color-muted: oklch(0.92 0 0);
    --color-muted-foreground: oklch(0.55 0.01 260);
    --color-border: oklch(0.9 0 0);

    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
  }
  ```

* **Tailwind v3 (`tailwind.config.js / ts`)**:
  Khai báo mở rộng thông qua `extend` để không làm mất bộ palette mặc định:
  ```ts
  /** @type {import('tailwindcss').Config} */
  module.exports = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          background: 'hsl(var(--background) / <alpha-value>)',
          foreground: 'hsl(var(--foreground) / <alpha-value>)',
          primary: {
            DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
            hover: 'hsl(var(--primary-hover) / <alpha-value>)',
          },
        },
      },
    },
  };
  ```

### 1.2. Chuẩn mực thứ tự sắp xếp Class (Class Ordering Pipeline)
Việc sắp xếp class lộn xộn khiến code khó debug và tăng nguy cơ conflict. Agent phải tuân thủ nghiêm ngặt thứ tự từ **ngoài vào trong (Outside-In)**:

1. **Layout & Positioning**: `absolute`, `relative`, `fixed`, `inset-0`, `top-4`, `z-50`
2. **Display & Box Model**: `flex`, `grid`, `inline-flex`, `block`, `hidden`, `items-center`, `justify-between`, `gap-4`
3. **Dimensions & Spacing**: `w-full`, `max-w-md`, `h-10`, `p-4`, `px-6`, `my-auto`, `space-y-2`
4. **Typography**: `font-sans`, `text-sm`, `font-semibold`, `tracking-tight`, `leading-relaxed`, `text-foreground`
5. **Backgrounds & Borders**: `bg-background`, `border`, `border-border`, `rounded-xl`, `shadow-md`
6. **Visual Filters & Effects**: `opacity-90`, `blur-sm`, `backdrop-blur-md`
7. **Interactivity & States**: `transition-all`, `duration-200`, `hover:...`, `focus-visible:...`, `active:...`, `dark:...`

> **Tự động hóa**: Luôn khuyến nghị cấu hình `prettier-plugin-tailwindcss` để formatter tự động quản lý thứ tự này.

---

## 2. Responsive & State Design

### 2.1. Triết lý Mobile-First
* Class không có prefix đại diện cho màn hình **Mobile** (mặc định nhỏ nhất).
* Các breakpoint (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) đại diện cho `min-width` (áp dụng từ kích thước đó trở lên).
* **Cấm kỵ**: Tuyệt đối không tư duy Desktop-down (ví dụ: style desktop trước rồi cố dùng các trick để ghi đè trên mobile).
```tsx
// ✅ ĐÚNG: 1 cột trên mobile, 2 cột trên tablet, 3 cột trên desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

### 2.2. Advanced Relational Selectors (`group`, `peer`, `:has()`)
Khai thác sức mạnh của modern CSS selectors để viết logic tương tác không cần `useState`:

* **`group` và Named Groups**:
  Khi hover vào card cha, đổi style của icon và subtitle bên trong:
  ```tsx
  <div className="group/card relative p-6 bg-card hover:bg-muted/50 transition-colors">
    <h3 className="text-foreground group-hover/card:text-primary transition-colors">Title</h3>
    <p className="text-muted-foreground group-hover/card:translate-x-1 transition-transform">Sub</p>
  </div>
  ```

* **`peer` cho Form & Checkbox Controls**:
  ```tsx
  <input type="checkbox" id="terms" className="peer sr-only" />
  <label
    htmlFor="terms"
    className="px-4 py-2 border rounded-lg peer-checked:border-primary peer-checked:bg-primary/10 cursor-pointer"
  >
    Accept Terms
  </label>
  ```

* **Modern `:has()` Selector (Tailwind v3.4+ / v4)**:
  Thay đổi trực tiếp phần tử cha khi bất kỳ phần tử con nào đạt trạng thái nhất định:
  ```tsx
  {/* Card tự động sáng viền khi ô input con được focus */}
  <div className="border border-border p-4 rounded-xl has-[:focus-visible]:border-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/20 transition-all">
    <input type="text" className="w-full bg-transparent focus:outline-none" />
  </div>
  ```

---

## 3. Component Reusability & Clean Code

### 3.1. Hợp nhất Class với `cn()` Utility (`clsx` + `tailwind-merge`)
Agent **bắt buộc** cung cấp hàm helper `cn()` cho mọi component UI có thể nhận `className` từ ngoài vào, nhằm triệt tiêu xung đột class (specificity collision):

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3.2. Cấu trúc Component Variants với `class-variance-authority` (CVA)
Đối với các atomic components (Button, Badge, Alert), quản lý biến thể bằng CVA thay vì viết template string lồng nhau:

```tsx
// components/ui/badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border text-foreground hover:bg-muted",
        destructive: "bg-destructive/10 text-destructive border border-destructive/20",
      },
      size: {
        sm: "text-[10px] px-2 py-0.2",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
```

### 3.3. Quy tắc khắt khe về `@apply`
* **CẢNH BÁO TỐI CAO**: Lạm dụng `@apply` biến Tailwind thành CSS truyền thống tồi tệ, làm phình to file CSS xuất xưởng, phá vỡ khả năng Purge/Tree-shake của compiler và đánh mất tính Colocation.
* **Quy tắc**:
  * ❌ **KHÔNG** dùng `@apply` để tạo các class component như `.btn`, `.card`, `.input`. Hãy tạo **React Component** (`<Button>`, `<Card>`).
  * ✅ **CHỈ DÙNG** `@apply` cho:
    1. CSS Reset hoặc base typography toàn cục (ví dụ style các thẻ HTML trong Markdown blog `.prose h2 { @apply text-2xl font-bold; }`).
    2. Cấu hình pseudo-elements phức tạp mà Tailwind không hỗ trợ tiện dụng.

---

## 4. Modern Aesthetics & Advanced Utilities

### 4.1. Dark Mode Architecture
Sử dụng `class` strategy kết hợp CSS Variables để đổi theme tức thì mà không cần re-render cây DOM:
* Luôn sử dụng cặp màu tương phản: `bg-background text-foreground dark:bg-zinc-950 dark:text-zinc-50`.
* Không hardcode đen thuần (`#000000`) cho dark mode nền rộng. Hãy dùng gam màu tối có chiều sâu (`zinc-900`, `zinc-950`, `slate-950`).

### 4.2. Glassmorphism Formula (Chuẩn UI Cao Cấp)
Để tạo hiệu ứng kính mờ (frosted glass) chuẩn Apple/Vercel:
```tsx
className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5"
```

### 4.3. Mesh Gradients & Glow Accents
Tạo chiều sâu cho giao diện bằng gradient trong suốt (alpha gradients):
```tsx
<div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl pointer-events-none" />
```

### 4.4. Sleek Custom Scrollbar
Không cần cài thư viện nặng, định nghĩa utility scrollbar mượt:
```css
/* Trong globals.css */
@utility scrollbar-thin {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: hsl(var(--border));
    border-radius: 9999px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground));
  }
}
```

---

## 5. Masterclass Component: Interactive Feature Card

Ví dụ chuẩn mực kết hợp toàn bộ: Semantic tokens, Responsive grid, `group-hover`, `:has()`, Glassmorphism, và Dark Mode.

```tsx
import * as React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  category: string;
  description: string;
  badge?: string;
  featured?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  category,
  description,
  badge,
  featured = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        // 1. Layout & Sizing
        "group/card relative flex flex-col justify-between overflow-hidden",
        "w-full rounded-2xl p-6 sm:p-8",
        // 2. Visuals (Glassmorphism + Dark Mode)
        "bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl",
        "border border-zinc-200/80 dark:border-zinc-800/80",
        "shadow-sm hover:shadow-xl hover:shadow-primary/5",
        // 3. Transitions & State Interactions
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-primary/40 dark:hover:border-primary/50",
        // 4. Modern :has() Selector
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
        // 5. Featured Accentuation
        featured && "ring-1 ring-primary/20 dark:ring-primary/30",
        className
      )}
      {...props}
    >
      {/* Background Micro Glow Effect on Hover */}
      <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-bl from-primary/15 via-primary/5 to-transparent blur-2xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100 pointer-events-none" />

      {/* Top Header Section */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {category}
          </span>
          {badge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              {badge}
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 transition-colors group-hover/card:text-primary">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {/* Footer Interactive Action */}
      <div className="mt-8 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 group-hover/card:text-zinc-900 dark:group-hover/card:text-zinc-200 transition-colors">
          Explore Architecture
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all duration-300 group-hover/card:bg-primary group-hover/card:text-white group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
```

---

## 6. AI Agent Pre-flight Checklist

Trước khi hoàn tất bất kỳ UI component nào sử dụng Tailwind CSS, Agent **bắt buộc** rà soát:

- [ ] **Mobile-First Check**: Đã thiết lập style mặc định cho mobile và chỉ dùng breakpoint `sm:`, `md:`, `lg:` để override khi lên desktop chưa?
- [ ] **Class Order**: Thứ tự class đã đi từ Layout -> Display -> Spacing -> Typography -> Visual -> State chưa?
- [ ] **Specificity Collision**: Đã dùng `cn()` để gộp các class truyền từ ngoài props vào chưa?
- [ ] **No Raw Hex Values**: Có mã màu hex tuỳ tiện nào chưa được chuẩn hoá thành semantic token (`primary`, `border`, `background`) không?
- [ ] **No `@apply` Abuses**: Có vô tình viết `@apply` cho component React thay vì viết utility classes trực tiếp không?
- [ ] **Contrast & Dark Mode**: Các cặp màu chữ/nền (`text-zinc-900 dark:text-zinc-50`) đã đảm bảo tỷ lệ tương phản WCAG 2.1 AA tối thiểu 4.5:1 chưa?
