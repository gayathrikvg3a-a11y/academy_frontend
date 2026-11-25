# ROADMAP.md — execution order

Phased checklist for the conversion in [PLAN.md](PLAN.md). Ordered so shared pieces land before their consumers; **every phase must end with `npm run build` green.** MUI and Tailwind coexist happily until the final removal.

Size is relative effort. **S** = mechanical · **M** = a session · **L** = heavy · **XL** = budget extra.

> **13 routes, not 12.** `/students/:id/progress` → `CourseProgress.jsx` (652 lines) is real, routed, and missing from earlier surveys of this codebase. Do not lose it.

---

## Phase 0 — Seed · S

- [x] Copy `cignes_academy_web-frontend` → this folder, **excluding** `node_modules/`, `build/`, `build.zip`, `.git/`
- [x] `git init`, commit the unmodified copy as the baseline — every later phase stays diffable against MUI
- [x] Decide: `git rm -r --cached build` or keep committing `build/` (it is gitignored yet tracked today)
- [x] `npm install && npm run dev` — confirm the app runs unchanged before touching anything
- [x] Confirm all **13** routes load

---

## Phase 1 — Foundation · M

*Nothing looks different yet. This phase only makes Tailwind available.*

- [x] `npm i` the runtime set (PLAN.md → Dependencies). **`shadcn` is a runtime dep, not just a CLI**
- [x] `npm i -D tailwindcss @tailwindcss/vite typescript`
- [x] **`tsconfig.json`** — new, single file, `allowJs` + `verbatimModuleSyntax` + `@/*` paths
- [x] **`vite.config.js`** — add `tailwindcss()` + alias. ⚠️ **`__dirname` is undefined here** (`"type": "module"`); use `fileURLToPath(new URL('./src', import.meta.url))`. Keep `build.outDir: "build"` and `server.allowedHosts`
- [x] **`src/index.css`** — CRM's 131 lines verbatim, then the fenced `--success` / `--warning` block. Add a comment noting `shadcn/tailwind.css` is load-bearing
- [x] **Decide the brand hue** — violet (CRM default) or keep indigo via the one-line `--primary` override. Cheap now, surprising later
- [x] **`src/lib/utils.js`** — `cn`, `formatINR`, `formatDate`, `formatDateTime`, `initials`
- [x] **`.oxlintrc.json`** — add `"typescript"` to `plugins`
- [x] Remove `<CssBaseline/>` in **this same commit** as the CSS swap (avoids duelling resets)
- [x] `npm run build` green with Tailwind active and MUI still installed

> Land tsconfig + the alias **before** Phase 2, or the editor lights up red.

---

## Phase 2 — Vendor the primitives · M

- [x] Copy ~29 primitives from the CRM's `src/components/ui/` → `src/components/ui/`, **verbatim as `.tsx`** (list in PLAN.md)
- [x] Copy `src/hooks/use-mobile.ts`
- [x] Resolve imports transitively — if a copied file imports one not on the list, **copy that too** rather than editing it
- [x] Copy + **compress** the CRM's `assets/login-bg.jpg` (1.24 MB as shipped)
- [x] Optionally scope the CRM's `.prettierrc` to `src/components/ui/**` so vendored files stay format-identical
- [x] Smoke test: render a `<Button>` and `<Card>` on `/dashboard`; confirm Geist loads and the primary hue is right
- [x] **Verify `shadcn/tailwind.css` actually resolved** — a `data-open:` or `shimmer` class must emit CSS. Silent no-op is the failure mode

> Vendored = read-only. To update, re-copy from the CRM.

---

## Phase 3 — Shell · L

- [x] **`src/app/navigation.js`** — 9 items, 6 groups, lucide icons
- [x] **`src/app/auth.js`** — `login()` (unchanged `login_identifier` contract) + best-effort `GET auth/profile/` → `localStorage.user`; `logout()`; `getStoredUser()`
- [x] **`src/hooks/use-current-user.js`** — cached read, one-shot profile fetch for pre-existing sessions, `"Admin"` fallback
- [x] **`src/app/theme-provider.jsx`** — next-themes passthrough
- [x] **`src/app/layout/app-sidebar.jsx`** — brand tile uses this app's `logo-cignes.png`; wire `isActive` with longest-prefix matching; keep `SidebarRail`; **no logout in the footer**
- [x] **`src/app/layout/app-header.jsx`** — trigger + separator + breadcrumb; ⌘K palette; theme toggle; avatar menu with Sign out
- [x] `pageTitleForPath` — drop the `"/" → Dashboard` special case; longest-prefix so `/students/9/progress` → "Students"
- [x] **`src/components/Layout.jsx`** — 498 lines → ~35
- [x] **`src/App.jsx`** — swap providers, mount `<Toaster richColors position="top-right" />`. **Copy the 13-route block character-for-character**
- [x] **`src/api/axios.js`** — also clear `localStorage.user` in the 401-refresh-failure path
- [x] `ProtectedRoute.jsx` — **leave alone** (14 lines, zero MUI, correct)
- [x] Verify: rail collapse, ⌘B, cookie persistence, Sheet drawer under 768px, all 13 routes reachable, detail routes light their parent nav item

> Pages still look like MUI inside the new shell. Expected. Just make sure no page still renders a `<Toolbar/>` spacer.

---

## Phase 4 — Login · M

- [x] Rebuild `src/pages/Login.jsx` to the CRM's split-screen (structure in PLAN.md)
- [x] Keep `api.post("auth/login/", { login_identifier: identifier, password })`, localStorage access+refresh, `navigate("/dashboard")`
- [x] Best-effort profile hydration after login — **must never block or fail login**
- [ ] Verify against the live backend: real credential signs in; bad one shows the destructive Alert; **`login_identifier` is still the payload key in the Network tab**

---

## Phase 5 — Common layer · L

**Highest leverage in the project.** Preserve every prop signature — this restyles ~45 consumers without touching a call site.

- [x] `PageHeader.jsx` — keep `back` + `meta`; **drop its own `mb`**
- [x] `FormDialog.jsx` — CRM Dialog; the `maxWidth` map is critical (default `sm:max-w-sm` would make all 11 forms 384px wide); add `max-h-[85svh] overflow-y-auto`
- [x] `FormSection.jsx` — grid + `[&+&]` divider. **Grep `gridColumn: "1 / -1"`** → `sm:col-span-2 lg:col-span-3`
- [x] `FilterBar.jsx` — bare flex row (CRM) vs bordered card (today). **Design call — see PLAN.md**
- [x] `TableCard.jsx` — `overflow-hidden rounded-xl border`; drop `sx` (**zero call sites pass it**); no `TableContainer` needed
- [x] `LoadingButton.jsx` — Button + Spinner, MUI-shaped props mapped internally; keep the label, don't swap it for "Loading..."
- [x] `ConfirmDialog.jsx` — CRM AlertDialog
- [x] `useSnackbar.js` — reimplement over sonner, **keep the return shape**
- [x] `SnackbarAlert.jsx` → `() => null` (deleted in Phase 10)
- [x] `useConfirm.js` — **no change**
- [x] **NEW `common/FormField.jsx`** — Field/Input/Textarea, passes `name`, calls `onChange(event)` natively
- [x] **NEW `common/FormSelect.jsx`** — synthesises `onChange({target:{name,value}})`; handles the `"" ↔ "__all__"` sentinel once
- [x] **NEW `common/StatusBadge.jsx`** — one status→variant lookup replacing five `getXStatusColor` switches
- [x] Walk every page: chrome should be CRM-shaped even though field internals are still MUI
- [x] Test one wide form dialog immediately

---

## Phase 6 — Icon map · S

- [x] Map all 45 `@mui/icons-material` imports to lucide, **once**, as a comment block — don't re-derive it 43 times

| MUI | lucide | | MUI | lucide |
|---|---|---|---|---|
| `Add` | `Plus` | | `ArrowBack` | `ArrowLeft` |
| `Delete` | `Trash2` | | `CurrencyRupee` | `IndianRupee` |
| `Edit` | `Pencil` | | `PictureAsPdf` | `FileText` |
| `Search` | `Search` | | `WorkspacePremium` | `Award` |
| `MoreVert` | `MoreVertical` | | `ReceiptLong` | `Receipt` |
| `Visibility` | `Eye` | | `PersonAdd` | `UserPlus` |
| `School` | `GraduationCap` | | `ContactPhone` | `PhoneCall` |
| `Close` | `X` | | `PhotoLibrary` | `Images` |
| `FilterAltOff` | `FilterX` | | `PlayCircle` | `CirclePlay` |
| `Groups` | `Users` | | `Refresh` | `RotateCw` |
| `Payments` | `CreditCard` | | `Print` | `Printer` |
| `MenuBook` | `Library` | | `AccountBalanceWallet` | `Wallet` |
| `Event` | `CalendarDays` | | `Collections` | `FolderOpen` |
| `KeyboardArrowDown` | `ChevronDown` | | `KeyboardArrowUp` | `ChevronUp` |
| `CheckCircle` | `CheckCircle2` | | `RadioButtonUnchecked` | `Circle` |
| `Notes` | `FileText` | | `Description` | `FileText` |
| `Person` | `User` | | `QuestionAnswer` | `MessageSquare` |
| `TrendingUp` | `TrendingUp` | | `Today` | `CalendarDays` |
| `Star` | `Star` | | `AddPhotoAlternate` | `ImagePlus` |
| `EventAvailable` | `CalendarCheck` | | `Phone` | `Phone` |

`*Outlined` variants collapse to the same icon — lucide has one weight. Verified: lucide 1.28 keeps both legacy and new names (`MoreVertical`/`EllipsisVertical`, `PlayCircle`/`CirclePlay` all resolve).

- [x] Every icon+label button gets `data-icon="inline-start"` — **load-bearing**, drives padding

---

## Phase 7 — Filters, paginations, stat cards · M

- [x] **7 filter bars** in one pass — near-identical. `TextField`→`FormField`, `TextField select`→`FormSelect`, `MenuItem`→`SelectItem`
- [x] **2 paginations** — reproduce the CRM's `Showing X–Y of N` + outline Prev/Next (~25 lines each). **Do not** vendor `ui/pagination.tsx`
- [x] **`StudentCards` (152), `PaymentCards` (147)** — `Grid`→Tailwind grid; drop the hover shadow lift

---

## Phase 8 — Tables · XL

Do `PaymentTable` first as the reference implementation, then `StudentTable` (hardest), then by size.

- [x] `PaymentTable` 130 · S — reference impl
- [x] `CourseTable` 174 · S
- [x] `GalleryTable` 196 · S
- [x] `InternshipTable` 209 · S
- [x] `BatchTable` 225 · S
- [x] `BatchStudents` 298 · M
- [x] `EventTable` 425 · M — 15 hexes
- [x] `StudentTable` 575 · **L** — 27 hexes, Avatar, 3-tier payment cell, 5-item action Menu
- [x] `StudentPayments` 682 · **XL** — dialog + table + form composite; consider splitting the file

Per table: `Chip`→`StatusBadge`, `IconButton`→`Button size="icon-sm" variant="ghost"`, `Menu`→`DropdownMenu`, `CircularProgress`→`Spinner`, empty row→`Empty`. **Delete every `#fafafa`/`#f9fafb` hover and head fill** — `TableRow` already ships `hover:bg-muted/50`.

---

## Phase 9 — Panels, dialogs, forms, pages · XL

- [x] **Detail panels** — `LessonCard` 166 · S, `CourseOverview` 232 · M, `BatchOverview` 319 · M (needs `progress`), `Curriculum` 686 · **XL**
- [x] **Bespoke dialogs** — `EventDialog` 202 · M, `AssignStudentDialog` 217 · M, `PaymentReceiptDialog` 313 · M, `GalleryItemsDialog` 384 · L, `StudentDetails` 452 · L, `StudentCertificates` 537 · L
- [x] **11 form dialogs** — `ModuleForm` 164, `AlbumForm` 277, `LessonForm` 281, `GalleryItemForm` 329, `BatchForm` 333, `CourseForm` 346, `InternshipForm` 379, `EventForm` 382, `EnquiryForm` 413, `PaymentForm` 479, `StudentForm` 733. M each **given the Phase 5 adapters**; XL each without them
- [x] **Simple pages** — `Gallery` 226, `Internships` 248, `Events` 258, `Courses` 269, `Batches` 282, `Dashboard` 308, `Payments` 514, `Students` 542. Mostly thin after the batches above
- [x] `Dashboard` — rebuild the 8 stat cards on `Card` + `grid gap-4 sm:grid-cols-2 xl:grid-cols-4`; **replace the 8 saturated accents with muted `bg-muted` icon tiles** (design call — see PLAN.md); drop the hover shadow
- [x] **Detail pages** — `CourseView` 145 · S, `BatchView` 164 · S (both need `tabs`)
- [x] **`CourseProgress` 652** · **XL** — the easily-missed 13th page. 3× `TableCard`, imports `colors`
- [x] **`Enquiries` 756** · **XL** — schedule last, riskiest single file

**Two normalisation targets** — the only pages that break the house pattern:

- [x] `Enquiries.jsx` — imports 20 MUI components directly, renders a raw `Card`/`TableContainer`/`Table`, has no `FilterBar`, and inlines three dialogs. **Normalise first, restyle second:** extract `components/EnquiryTable.jsx` on `TableCard`; route the view + call-history dialogs through `FormDialog`; drop the inline confirm for the `useConfirm` it already imports. Turns one XL job into two M jobs
- [x] `CourseView.jsx` — hand-rolls back button + `h4` + `subtitle1` + three Chips, which is exactly `PageHeader`'s `{back, title, subtitle, meta}`. ~45-line deletion; check `BatchView.jsx` for the same

---

## Phase 10 — Cleanup · S

- [x] Delete the `SnackbarAlert` import + JSX from all 13 consumers; simplify `useSnackbar` to `{ showSnackbar }`
- [x] Delete `src/theme.js` — **only after all 11 importers are converted**
- [x] Delete unused `assets/hero.png`, `react.svg`, `vite.svg` (grep first)
- [x] `npm rm @mui/material @mui/icons-material @emotion/react @emotion/styled` — **last, not first**
- [x] Grep gates, each returning nothing under `src/`:
  - [x] `rg 'from "@mui' src/`
  - [x] `rg '@emotion/' src/`
  - [x] `rg '\bsx=\{' src/`
  - [x] `rg 'from "\.\.?[./]*theme"' src/`
  - [x] `rg '#[0-9a-fA-F]{3,8}\b' src/ --glob '!src/index.css'`
- [x] `npm run lint && npm run build`

---

## Phase 11 — Verification · M

Run with the CRM open side by side (`cd "Cignes CRM/frontend" && pnpm dev`).

- [x] **All 13 routes** load — diff `App.jsx` against the original to prove none added or removed
- [x] Sidebar lights the parent on `/courses/:id`, `/batches/:id`, `/students/:id/progress`
- [x] **Dark mode** — Light/Dark/System across every route hunting unreadable text. Status chips, table hovers and dashboard tiles are the likeliest failures. Also test with the OS in dark
- [x] **Responsive** — below 768px the sidebar becomes a Sheet drawer
- [x] **Density vs the CRM** — buttons 32px, inputs 32px, header 56px, sidebar 256px, cards `rounded-xl` + `ring-1` + no shadow, **table heads not uppercase**
- [x] **Regression sweep** — one create, edit and delete on Students and Payments; inline `formErrors.js` messages still render; sonner toasts fire where Snackbars did
- [x] Token-expiry round-trip: confirm the 401→refresh interceptor still works
- [x] Login round-trip against the live backend one final time

---

## Progress

| Phase | Size | Status |
|---|---|---|
| 0 · Seed | S | ✅ |
| 1 · Foundation | M | ✅ |
| 2 · Vendor primitives | M | ✅ |
| 3 · Shell | **L** | ✅ |
| 4 · Login | M | ✅ |
| 5 · Common layer | **L** | ✅ |
| 6 · Icon map | S | ✅ |
| 7 · Filters, paginations, cards | M | ✅ |
| 8 · Tables | **XL** | ✅ |
| 9 · Panels, dialogs, forms, pages | **XL** | ✅ |
| 10 · Cleanup | S | ✅ |
| 11 · Verification | M | ✅ |

Phases 8–9 are roughly two-thirds of the total. Phases 1–6 are the ones that change how everything looks; 7–9 are volume.

**The five files most likely to overrun:** `Enquiries` 756 · `StudentForm` 733 · `Curriculum` 686 · `StudentPayments` 682 · `CourseProgress` 652.
