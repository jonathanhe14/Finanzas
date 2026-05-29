# Finanzas App — Design System (Master)

> Dark-mode, minimalist, modern-futuristic. Numbers-first. Smooth motion.

**Style:** Modern minimalism with subtle glow — dark OLED-friendly base, cyan electric accent.
**Personality:** Quiet confidence. Precise. Tech-forward without being cold.
**Stack:** React 19 · Vite · Tailwind CSS 3.4 · Lucide icons.

---

## 1. Color System

### Base / Surfaces

| Token | Hex | Use |
|---|---|---|
| `bg-base` | `#0A0B0F` | Page background (near-black, cool tint) |
| `bg-surface` | `#11141B` | Cards, modals (elevation 1) |
| `bg-elevated` | `#161A23` | Hover, raised surfaces (elevation 2) |
| `bg-sunken` | `#08090D` | Inputs, recessed wells (sunk below base) |
| `bg-glass` | `rgba(17, 20, 27, 0.72)` | Backdrops with blur (sidebar, header) |

### Borders

| Token | Value | Use |
|---|---|---|
| `border-subtle` | `rgba(255,255,255,0.05)` | Internal dividers |
| `border-default` | `rgba(255,255,255,0.08)` | Card borders |
| `border-strong` | `rgba(255,255,255,0.14)` | Inputs, focused state base |
| `border-accent` | `rgba(6,182,212,0.45)` | Focus, active selections |

### Text

| Token | Hex | Contrast vs `bg-base` | Use |
|---|---|---|---|
| `text-primary` | `#E6E8EC` | 14:1 ✓ | Primary text, headings |
| `text-secondary` | `#9CA3B0` | 6.1:1 ✓ | Body, descriptions |
| `text-muted` | `#6B7280` | 4.5:1 ✓ | Captions, labels |
| `text-faint` | `#4B5260` | 3:1 ✓ | Placeholders, disabled |

### Brand & Accents

| Token | Hex | Use |
|---|---|---|
| `accent` | `#06B6D4` | Primary action, focus glow, active indicators |
| `accent-soft` | `rgba(6,182,212,0.12)` | Hover backgrounds, soft fills |
| `accent-glow` | `rgba(6,182,212,0.35)` | Glow effects, focus rings |
| `brand-2` | `#8B5CF6` | Secondary accent (violet), gradient pair |
| `brand-gradient` | `linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)` | Hero accents, logo, brand moments |

### Semantic (tuned for dark)

| Token | Hex | Soft bg | Use |
|---|---|---|---|
| `success` | `#10B981` | `rgba(16,185,129,0.12)` | Ingresos, balances positivos |
| `danger` | `#F43F5E` | `rgba(244,63,94,0.12)` | Gastos, destructivos, errores |
| `warning` | `#F59E0B` | `rgba(245,158,11,0.12)` | Deudas, alertas |
| `info` | `#38BDF8` | `rgba(56,189,248,0.12)` | Transferencias, notas |

### Rules

- Body text contrast vs `bg-base` ≥ 4.5:1. Secondary ≥ 3:1.
- Color never as the only signifier — always pair with icon, sign, or label.
- Hover increases surface elevation by 1 step (e.g. `bg-surface` → `bg-elevated`).
- No pure white (`#FFFFFF`) anywhere except brand logo glyph and explicit overlays.
- Borders use rgba whites (translucent), never solid grays — they adapt to underlying surface.

---

## 2. Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

| Role | Family | Use |
|---|---|---|
| `font-display` | Space Grotesk | Page titles, hero numerics (modern geometric) |
| `font-sans` | Inter | All UI text, body, buttons |
| `font-mono` | JetBrains Mono | Amounts, balances, IDs, codes |

### Type scale

| Token | Size / Line | Weight | Tracking | Use |
|---|---|---|---|---|
| `text-display` | 36/40 | 600 | -0.025em | Hero figures (login title, page H1 on Dashboard hero KPI) |
| `text-h1` | 24/30 | 600 | -0.02em | Page titles |
| `text-h2` | 18/24 | 600 | -0.015em | Section titles |
| `text-h3` | 14/20 | 600 | -0.01em | Card titles |
| `text-body` | 14/20 | 400 | 0 | Default UI text |
| `text-sm` | 13/18 | 400 | 0 | Secondary |
| `text-caption` | 12/16 | 500 | 0 | Helper, captions |
| `text-eyebrow` | 11/14 | 600 uppercase | 0.12em | Labels above values |

### Numeric scale (font-mono, tabular-nums, always)

| Token | Size / Line | Weight | Use |
|---|---|---|---|
| `text-num-hero` | 32/36 | 500 | Featured KPI (e.g. balance principal) |
| `text-num-lg` | 22/26 | 500 | Standard KPI cards |
| `text-num-md` | 15/20 | 500 | Inline amounts in lists |
| `text-num-sm` | 13/18 | 500 | Secondary amounts |

### Rules

- All monetary values use `font-mono` + `font-variant-numeric: tabular-nums`. **Required.**
- Display font for titles only. Body in Inter. Numbers always in JetBrains Mono.
- Negative figures: prefix `−` (Unicode minus U+2212, not hyphen). Positive: no `+` unless contrasting (income vs expense both shown).
- Letter-spacing negative on headings, default on body, positive (`tracking-widest`) on eyebrows.

---

## 3. Spacing & Radius

### Spacing (Tailwind defaults, 4px rhythm)

| Token | px | Use |
|---|---|---|
| `space-1` | 4 | Icon ↔ label |
| `space-2` | 8 | Compact gaps |
| `space-3` | 12 | Field padding |
| `space-4` | 16 | Card padding (compact) |
| `space-5` | 20 | Card padding (standard) |
| `space-6` | 24 | Section gaps |
| `space-8` | 32 | Major sections |
| `space-10` | 40 | Page top spacing |

### Radius

| Token | px | Use |
|---|---|---|
| `radius-sm` | 6 | Chips, tags, small badges |
| `radius-md` | 10 | Buttons, inputs |
| `radius-lg` | 14 | Sidebar nav items |
| `radius-xl` | 18 | Icon containers |
| `radius-2xl` | 20 | Cards |
| `radius-3xl` | 24 | Modals |
| `radius-pill` | 9999 | Pill chips, avatars |

### Elevation (dark mode uses border + glow, not heavy shadows)

| Token | Spec | Use |
|---|---|---|
| `shadow-card` | `0 1px 2px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)` | Default card |
| `shadow-card-hover` | `0 8px 24px -8px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.08)` | Card hover |
| `shadow-modal` | `0 24px 64px -12px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)` | Modal panel |
| `shadow-glow` | `0 0 0 1px rgba(6,182,212,0.4), 0 0 24px -4px rgba(6,182,212,0.4)` | Focus state, primary CTA hover |
| `shadow-focus` | `0 0 0 3px rgba(6,182,212,0.25)` | Input/button focus ring |

No layered/neumorphic shadows. Stay flat with subtle inner border for definition.

---

## 4. Motion

| Token | Spec |
|---|---|
| `duration-fast` | 120ms (micro: ripple, press) |
| `duration-base` | 200ms (hover, color shifts) |
| `duration-slow` | 280ms (modal in, drawer expand) |
| `duration-page` | 380ms (page transitions) |
| `easing-standard` | `cubic-bezier(0.16, 1, 0.3, 1)` (default) |
| `easing-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot for delight) |
| `easing-ease-out` | `cubic-bezier(0.4, 0, 0.2, 1)` (exit) |

### Rules

- Animate `transform` and `opacity` only. Never `width`/`height`/`top`/`left`.
- Hover: subtle elevation rise (no scale on cards; scale `0.97` on press for buttons only).
- Sidebar rail expand: 280ms `easing-standard`. Labels fade in at 100ms.
- Number changes: animate count-up over 600ms with `easing-standard` for KPIs.
- Modal: scale `0.96 → 1` + translate-y-2 → 0 + fade. 280ms `easing-standard`.
- Skeleton shimmer: 1.5s linear infinite gradient sweep.
- Page mount: `fade-up` (translate-y-2 + opacity), 380ms.
- Respect `prefers-reduced-motion`: cut all transitions to 0ms.

---

## 5. Components

### 5.1 Sidebar — Rail Expansible

- **Collapsed:** 64px wide, icon-only (centered 20px icons).
- **Expanded on hover:** 224px wide, labels fade in from left.
- Background: `bg-glass` with `backdrop-blur-xl`, border-right `border-subtle`.
- Active item: cyan vertical bar (3px wide) on left + `bg-accent-soft` + icon and label in `text-primary`.
- Hover (inactive): `bg-elevated`, icon `text-secondary` → `text-primary`.
- Logo at top: brand-gradient orb 32×32 + name (only visible expanded).
- Logout at bottom, separated by `border-subtle`.
- Transition: 280ms `easing-standard` for width. Labels fade 200ms with 60ms delay on expand.

### 5.2 KPI Card

```
┌─────────────────────────────────┐
│  [icon]            [chip]       │
│                                 │
│  EYEBROW LABEL                  │
│  ₡ 1,234.56                     │
│                                 │
│  ↗ +12% vs mes pasado           │
└─────────────────────────────────┘
   bg-surface · radius-2xl · shadow-card · p-5
```

- Icon container: 36×36, `radius-xl`, semantic soft bg, icon in 600 color.
- Amount: `text-num-lg` `font-mono` `tabular-nums` `text-primary`.
- Chip: pill, semantic colors, `text-eyebrow` styling.
- Hover: `shadow-card-hover`. No transform.
- Featured KPI (one per page): uses `text-num-hero` with brand-gradient text fill.

### 5.3 List Row

```
[icon] Title              ₡ 1,234.00
       Subtitle           tipo · fecha
```

- Icon 40×40, `radius-xl`, semantic soft bg.
- Title `text-body font-medium text-primary`.
- Subtitle `text-caption text-muted`.
- Amount: `text-num-md` right-aligned, semantic color (rose/emerald/sky).
- Hover: `bg-elevated`, optional action button fades in.
- Row separator: `divide-y divide-border-subtle`.

### 5.4 Modal

```
┌──────────────────────────────────────┐
│ Title                            [×] │
│ Subtitle                              │
├──────────────────────────────────────┤
│  [form body — scroll]                 │
├──────────────────────────────────────┤
│  [Cancelar]    [Acción primaria]     │
└──────────────────────────────────────┘
  bg-surface · radius-3xl · shadow-modal
  overlay: bg-black/70 backdrop-blur-md
```

- Max-width 480. Header and footer fixed, body scrolls.
- Close button: 32×32 `bg-elevated` `radius-lg`.
- Enter: scale `0.96 → 1` + translate-y-2 → 0, 280ms `easing-standard`.
- Backdrop: heavy black + 8px blur — creates depth and focus.
- Escape closes. Click overlay closes. Body scroll locked while open.

### 5.5 Forms

**Input:**
- Bg `bg-sunken`, border `border-default`, `radius-md`, `py-2.5 px-3.5`, text-body.
- Focus: border `border-accent` + `shadow-focus` ring + bg `bg-sunken/80`.
- Placeholder `text-faint`.
- Disabled: `opacity-40 cursor-not-allowed`.
- Errors: `text-rose-400` below field with `bg-rose-500/10` indicator.

**Buttons:**

| Variant | Style |
|---|---|
| Primary | `bg-accent text-base hover:shadow-glow`, `radius-md` |
| Primary alt (gradient) | `bg-brand-gradient text-white`, `radius-md` |
| Secondary | `bg-elevated text-primary hover:bg-surface border border-default`, `radius-md` |
| Ghost | `text-secondary hover:text-primary hover:bg-elevated`, `radius-md` |
| Destructive | `bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/30` |

- Min height 36 (44 on touch).
- Press feedback: scale `[1, 0.97]` `duration-fast`.
- Disabled: opacity 40.

### 5.6 Chips / Badges

- Pill shape (`radius-pill`), `text-eyebrow` styling.
- Semantic: soft bg (12% opacity) + border (30% opacity) + text (400 shade).
- Inline icon optional (12px).

### 5.7 Empty States

- Centered, `bg-elevated` `border border-dashed border-default` `radius-2xl` `px-6 py-10`.
- Icon container 48×48 `radius-2xl bg-surface` with muted icon.
- Title `text-body font-semibold text-primary`, hint `text-caption text-muted`.

---

## 6. Layout

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | < 768 | Sidebar collapsed permanent, content full-width |
| Tablet | 768–1024 | Sidebar rail, content max-w-3xl |
| Desktop | ≥ 1024 | Sidebar rail expansible, content max-w-7xl centered |
| Ultra | ≥ 1440 | Content max-w-7xl centered |

- Page padding: 16px mobile, 24px tablet, 32px desktop.
- Sidebar leaves 64px gap (or 224 when hovered, but content doesn't reflow).

---

## 7. Iconography

- **Library:** Lucide-react only.
- **Sizes:** sm 14, md 16, lg 20, xl 24.
- **Stroke:** 1.75 default. Never mix in same hierarchy.
- **Color:** inherit from text. Inside tinted containers use the semantic 400/500 shade.

---

## 8. Money Formatting

- `Intl.NumberFormat('es-CR', { style: 'currency', currency: code })`.
- `₡` for CRC, `$` for USD.
- Always `font-mono tabular-nums`.
- Negative: `−` prefix in `text-rose-400`.
- Positive (when emphasizing income): `+` prefix in `text-emerald-400`.

---

## 9. Anti-patterns

- ❌ Pure white text or pure black bg
- ❌ Emoji as structural icons
- ❌ Heavy drop-shadows (use inset borders + soft glows)
- ❌ Color as the only meaning carrier
- ❌ Layout-shifting hovers
- ❌ Spinners alone for > 1s loads (use skeletons with shimmer)
- ❌ Hardcoded hex inside components — always tokens
- ❌ Disabling focus ring without alternative
- ❌ `width`/`height` animation (use `transform` or `max-width`)
- ❌ Mixing icon stroke widths in same view
- ❌ Multiple competing accent colors per view
- ❌ Bright neon glows everywhere — keep glow accent-only

---

## 10. Pre-Delivery Checklist

### Visual
- [ ] No raw hex in JSX, only tokens
- [ ] Cards use `radius-2xl`, modals `radius-3xl`, buttons `radius-md`
- [ ] Shadows from the scale only (no improvised values)
- [ ] Lucide icons only, no emojis in chrome

### Typography
- [ ] Headings Space Grotesk, body Inter, numbers JetBrains Mono
- [ ] All monetary values use `tabular-nums`
- [ ] Eyebrow labels use `tracking-widest uppercase`

### Color & Contrast
- [ ] `text-primary` on `bg-base` ≥ 14:1 ✓ verified
- [ ] `text-muted` on `bg-base` ≥ 4.5:1 ✓ verified
- [ ] Semantic colors paired with icon/sign

### Motion
- [ ] Transitions 120–280ms with `easing-standard`
- [ ] `prefers-reduced-motion` honored
- [ ] Only `transform`/`opacity` animated
- [ ] Sidebar rail expand smooth, labels fade

### Interaction
- [ ] All clickable items have `cursor-pointer`
- [ ] Focus rings visible via `shadow-focus`
- [ ] Press feedback on buttons (scale 0.97)
- [ ] Disabled states: 40% opacity + cursor-not-allowed
- [ ] Loading: skeleton shimmer for content, button spinner for actions

### Layout
- [ ] Mobile-first (375/768/1024/1440)
- [ ] Sidebar rail visible across breakpoints (or collapsed on mobile)
- [ ] Content max-w-7xl on desktop, centered

### Data
- [ ] Amounts use `formatMoney('es-CR')`
- [ ] Negative uses `−` not `-`
- [ ] Charts always have legend + tooltip + fallback
