---
name: motion-animation
description: >-
  Comprehensive guide and expert rules for implementing production-ready, performant (60-120 FPS),
  and accessible animations using Motion (motion.dev / framer-motion) in React.
  Use this skill whenever creating or modifying animations, gestures, scroll-linked effects,
  layout transitions, exit animations with AnimatePresence, or optimizing animation performance.
---

# Motion (`motion.dev`) Animation Engineering Skill

> **Target Library**: Motion for React (`motion/react` or `framer-motion` v11+)  
> **Role**: Senior Creative Technologist & Motion UI Architect  
> **Goal**: Guide AI agents to author silky-smooth (60–120 FPS), GPU-accelerated, physically realistic, and accessible animations.

---

## 1. Core API & Components

### 1.1. Component Primitives
* **Import Standard**:
  ```tsx
  // Modern Motion v11+
  import { motion, AnimatePresence } from "motion/react";

  // Legacy / Framer Motion backward compatibility
  import { motion, AnimatePresence } from "framer-motion";
  ```
* Every standard HTML and SVG element has a `motion` equivalent (`motion.div`, `motion.span`, `motion.button`, `motion.svg`, `motion.path`, etc.).
* `motion.*` components forward standard DOM attributes and introduce animation props.

### 1.2. Lifecycle Animation Props
* **`initial`**: Visual state prior to mount. Pass `false` to disable the initial entrance animation on page load.
* **`animate`**: Target visual state. Triggers whenever the value changes.
* **`exit`**: Target visual state when the component is unmounted from React DOM. **Requires** a parent `<AnimatePresence>`.
* **`transition`**: Defines how the animation transitions between states.

### 1.3. Transition Physics: Springs vs. Tweens
* **Spring (Default for natural UI feel)**:
  * **Never** use hardcoded linear easings for interactive elements. Physics-based springs adapt dynamically when interrupted.
  * `stiffness`: Tension of the spring (Default: ~100. Range: `100`–`400` for snappy UI).
  * `damping`: Resistance/friction (Default: ~10. Range: `15`–`30` to eliminate excessive shaking).
  * `mass`: Inertia/weight (Default: `1`).
  * `bounce`: High-level damping helper (`0` = no bounce, `0.25` = subtle natural bounce, `0.5` = playful).
  ```tsx
  transition={{
    type: "spring",
    stiffness: 350,
    damping: 25,
  }}
  ```
* **Tween (Only for fixed-duration progress or loops)**:
  * Use for progress bars, timers, spinners, or sequential keyframe curves.
  * Prefer cubic-bezier curves (e.g., `[0.16, 1, 0.3, 1]` for `easeOutExpo`) instead of generic `"ease-in-out"`.

---

## 2. Advanced Interactions & Gestures

### 2.1. Declarative Gestures
Avoid managing mouse/touch hover states via `useState` whenever possible. Use declarative gesture props:
* **`whileHover`**: Active while pointer is hovered.
* **`whileTap`**: Active while button/element is pressed down (`scale: 0.96` to `0.98`).
* **`whileFocus`**: Critical for keyboard accessibility styling.

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 20 }}
/>
```

### 2.2. Viewport Triggers (`whileInView`)
Enables scroll-triggered entrance animations without manual `IntersectionObserver` boilerplate:
```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }} // once: true prevents re-triggering; amount: visibility % threshold
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
/>
```

### 2.3. Scroll-Linked & Scroll-Driven Animations
Use the triad of `useScroll`, `useTransform`, and `useSpring`:
1. **`useScroll`**: Obtains scroll progress (`scrollYProgress` from `0` to `1`). Can track the entire window or a specific `target` container via a `ref`.
2. **`useTransform`**: Linearly interpolates scroll progress to pixel values, degrees, opacities, or colors.
3. **`useSpring`**: Dampens mouse-wheel step increments, turning discrete scroll steps into fluid movement.

---

## 3. Layout Animations & Orchestration

### 3.1. FLIP Layout Transitions (`layout` & `layoutId`)
* **`layout` prop**:
  * Automatically calculates FLIP (First, Last, Invert, Play) transformations when DOM layout changes (e.g., sorting, resizing, adding/removing items).
  * Use `layout="position"` when you only want to animate translation without warping content dimensions.
  * When animating elements with `border-radius`, pass `style={{ borderRadius: ... }}` directly on the `motion` element so Motion can correct distortion matrices.
* **`layoutId` (Shared Element Transitions)**:
  * Connects two separate components across states/views (e.g., Tab underline/pill, thumbnail to expanded modal).
  * When the old component unmounts and the new one mounts with the matching `layoutId`, Motion morphs smoothly between them.

### 3.2. `<AnimatePresence>`
Manages exit animations when components are conditionally rendered or removed from the DOM:
* Direct children **must** have a unique, stable `key`.
* **Modes**:
  * `mode="sync"` (default): Incoming and outgoing elements animate at the same time.
  * `mode="wait"`: Waits for the outgoing element's `exit` animation to complete before rendering the incoming element (crucial for page/route transitions).
  * `mode="popLayout"`: Removes exiting element from the document flow (absolute positioning underneath) so sibling elements can immediately slide into place with `layout`.

### 3.3. Variants & Orchestration
Variants decouple animation state definitions from components and enable propagation through the DOM tree:
* Parent state (e.g., `"open"`, `"closed"`) automatically cascades down to child `motion.*` components sharing the same variant keys.
* **Parent Orchestration properties**:
  * `staggerChildren`: Delay between each child element's animation start (e.g., `0.05`s).
  * `delayChildren`: Initial delay before the first child starts animating.
  * `when`: `"beforeChildren"` | `"afterChildren"`.

---

## 4. Performance & Accessibility (Non-Negotiables)

### 4.1. Compositor-Only Properties (60–120 FPS Rule)
* **NEVER** animate geometry properties directly using tweens:
  * ❌ Do not animate: `width`, `height`, `top`, `left`, `bottom`, `right`, `margin`, `padding`. These trigger CPU Reflow and Repaint.
  * ✅ Always animate: `x`, `y` (translates via `transform: translate3d`), `scale`, `rotate`, `opacity`.
* When resizing container dimensions is required, use the `layout` prop rather than animate `width`/`height`.

### 4.2. Accessibility (a11y) with `useReducedMotion`
Respect user preferences (`prefers-reduced-motion: reduce`):
```tsx
import { useReducedMotion } from "motion/react";

const shouldReduceMotion = useReducedMotion();

const animation = shouldReduceMotion
  ? { opacity: 1 }
  : { opacity: 1, y: 0 };
```

---

## 5. Reference Implementation Patterns

### Pattern 1: Fade-in Scroll Reveal & Reading Progress
*Smooth GPU entrance triggered as elements enter the viewport, combined with a spring-smoothed reading progress bar.*

```tsx
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "motion/react";

export const ScrollRevealSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Track scroll progress of container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Smooth scroll progress using spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  // Map progress to transformations
  const opacity = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [0.92, 1, 1, 0.95]);

  return (
    <div ref={containerRef} className="relative min-h-[60vh] flex items-center justify-center p-8">
      <motion.div
        style={shouldReduceMotion ? { opacity: 1 } : { opacity, scale }}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-white"
      >
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
          Performance First
        </span>
        <h2 className="text-3xl font-bold mt-2 mb-4">Accelerated Scroll Reveal</h2>
        <p className="text-zinc-400 leading-relaxed">
          Compositor-only transforms paired with useSpring maintain 120 FPS even under aggressive user scrolling.
        </p>
      </motion.div>
    </div>
  );
};
```

---

### Pattern 2: Shared Layout Card Expansion (`layoutId` Modal)
*A list of cards where clicking an item morphs the card into a full modal dialogue without manual coordinate math.*

```tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Item {
  id: string;
  title: string;
  category: string;
  description: string;
}

const ITEMS: Item[] = [
  { id: "1", title: "Motion Engineering", category: "Core Concept", description: "Deep dive into 120 FPS FLIP animations and spring mechanics." },
  { id: "2", title: "Shared Elements", category: "Layout Transition", description: "Seamlessly expand UI cards using unique layoutId orchestration." },
];

export const SharedLayoutCardExpansion: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ITEMS.map((item) => (
          <motion.div
            key={item.id}
            layoutId={`card-container-${item.id}`}
            onClick={() => setSelectedItem(item)}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer p-6 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <motion.p
              layoutId={`card-category-${item.id}`}
              className="text-xs font-semibold text-indigo-400 uppercase tracking-wider"
            >
              {item.category}
            </motion.p>
            <motion.h3
              layoutId={`card-title-${item.id}`}
              className="text-xl font-bold text-white mt-1"
            >
              {item.title}
            </motion.h3>
          </motion.div>
        ))}
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Card sharing layoutId */}
            <motion.div
              layoutId={`card-container-${selectedItem.id}`}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 p-8 rounded-2xl shadow-2xl z-10"
            >
              <div className="flex justify-between items-start">
                <div>
                  <motion.p
                    layoutId={`card-category-${selectedItem.id}`}
                    className="text-xs font-semibold text-indigo-400 uppercase tracking-wider"
                  >
                    {selectedItem.category}
                  </motion.p>
                  <motion.h2
                    layoutId={`card-title-${selectedItem.id}`}
                    className="text-2xl font-bold text-white mt-1"
                  >
                    {selectedItem.title}
                  </motion.h2>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-zinc-400 hover:text-white p-1"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Additional content fade in */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="mt-4 text-zinc-300 leading-relaxed"
              >
                {selectedItem.description}
              </motion.p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

---

### Pattern 3: Staggered Dropdown Menu (Variants Orchestration)
*A springy dropdown menu where child items smoothly cascade in sequence.*

```tsx
import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";

const menuVariants: Variants = {
  closed: {
    opacity: 0,
    scale: 0.94,
    y: -8,
    transition: {
      duration: 0.18,
      ease: [0.32, 0, 0.67, 0],
    },
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 28,
      delayChildren: 0.08,
      staggerChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  closed: { opacity: 0, x: -10 },
  open: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};

const MENU_ITEMS = [
  { label: "Dashboard", icon: "📊" },
  { label: "Settings", icon: "⚙️" },
  { label: "Team Members", icon: "👥" },
  { label: "API Keys", icon: "🔑" },
  { label: "Sign Out", icon: "🚪" },
];

export const StaggeredDropdownMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left p-6">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <span>Account Menu</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="absolute left-6 mt-2 w-56 origin-top-left bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50"
          >
            {MENU_ITEMS.map((item) => (
              <motion.button
                key={item.label}
                variants={itemVariants}
                whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:text-white rounded-md text-left transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

---

## 6. AI Agent Pre-flight Checklist

Before outputting any Motion animation code, verify the following checklist:

- [ ] **GPU Acceleration**: Are any layout-thrashing properties (`width`, `height`, `left`, `top`, `margin`) directly animated via tween? If yes, replace them with `transform` (`x`, `y`, `scale`) or the `layout` prop.
- [ ] **AnimatePresence Key & Mode**: Is every component with an `exit` prop wrapped in `<AnimatePresence>` with a unique, persistent `key`?
- [ ] **Physics Over Tweens**: Are interactive UI responses (hover, tap, menu expand) using spring physics (`stiffness`, `damping`) rather than hardcoded durations?
- [ ] **Accessibility (a11y)**: Is `useReducedMotion()` checked for extensive motion paths?
- [ ] **Clean Variants**: Are variant objects defined outside the component scope to avoid allocations on re-render?
