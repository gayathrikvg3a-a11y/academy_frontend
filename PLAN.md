# PLAN.md — Cignes Academy Admin, converted to the Cignes CRM design system

## What this project is

A conversion of `E:\workspace\PROJECTS\cignes_academy_web-frontend` (the academy admin panel) onto the design system of `E:\workspace\PROJECTS\Cignes CRM\frontend`.

Both apps serve the same domain against the **same backend host** (`https://cacrm.fleetnflow.com/api/`), but they look nothing alike:

|  | Academy (source app) | CRM (design source) |
|---|---|---|
| UI layer | MUI v9 + Emotion | Tailwind v4 + shadcn/ui `base-nova` on **Base UI** |
| Language | plain JS/JSX, no tsconfig | TypeScript |
| Icons | `@mui/icons-material` (45 distinct) | `lucide-react` |
| Font | `system-ui` stack, no webfont | Geist Variable |
| Brand | indigo `#4f46e5` | **violet** `oklch(0.393 0.189 302.058)` |
| Radius | 4–12px, ad hoc | one `--radius: 0.625rem` ladder |
| Density | 48px controls | **32px** controls |
| Surfaces | `1px solid #e5e7eb` | `ring-1 ring-foreground/10` |
| Shell | dark `#111827` MUI Drawer, bare AppBar | 16rem ↔ 3rem icon-rail sidebar, h-14 header |
| Dark mode | none | full `.dark` token set |

The goal is for this app to become **indistinguishable from the CRM** — same shell, same login, same buttons, same density — without adding or removing a single page.

Because the two stacks are opposites, this is a full framework swap, not a re-theme. MUI and Emotion come out entirely.

## Routes — 13, fixed, do not add or remove

> ⚠️ **Verified directly against `src/App.jsx`.** An earlier survey of this codebase reported 12 routes and omitted `/students/:id/progress`. There are **13**. `CourseProgress.jsx` is 652 lines — the third-largest file in the app — and is fully wired: routed in `App.jsx`, backed by `api/progressApi.js`.

| Route | Page file | Lines | Notes |
|---|---|---|---|
| `/` | `Login.jsx` | 138 | public, no layout wrapper |
| `/dashboard` | `Dashboard.jsx` | 308 | 8 stat cards + total collection |
| `/enquiries` | `Enquiries.jsx` | 756 | largest page; breaks the house pattern |
| `/students` | `Students.jsx` | 542 | |
| **`/students/:id/progress`** | **`CourseProgress.jsx`** | **652** | **easy to miss — 3× `TableCard`, imports `colors`** |
| `/courses` | `Courses.jsx` | 269 | |
| `/courses/:id` | `CourseView.jsx` | 145 | tabs: Overview / Curriculum |
| `/batches` | `Batches.jsx` | 282 | |
| `/batches/:id` | `BatchView.jsx` | 164 | tabs: Overview / Students |
| `/events` | `Events.jsx` | 258 | |
| `/gallery` | `Gallery.jsx` | 226 | |
| `/internships` | `Internships.jsx` | 248 | |
| `/payments` | `Payments.jsx` | 514 | |
| `*` | → redirect `/dashboard` | | |

**Verified file counts:** `pages/` 13 · `components/` 43 · `components/common/` 10 · `api/` 10 · `utils/` 1 · `src/` 3 (`App.jsx`, `main.jsx`, `theme.js`).

Note `/students/:id/progress` gets **no sidebar entry** (like `/courses/:id` and `/batches/:id`) — it is reached from the Students table.

## Decisions

| Question | Decision | Why |
|---|---|---|
| Stack | **Full swap** to Tailwind v4 + shadcn `base-nova` + Base UI + lucide | A MUI re-theme tops out ~85%; floating labels, ripples and Material tables still read as Material |
| Location | New folder, seeded by copying the original | Original stays untouched and runnable |
| Tables | **Restyle only, keep logic** | No TanStack Table / `DataTable` / `useTableState`. Existing fetch + local filter + pagination state stays |
| Header | All four CRM features | Sidebar trigger + breadcrumb, user avatar menu + Sign out, dark mode toggle, ⌘K palette |
| Login | **Visual parity only** | Keeps `{login_identifier, password}`, localStorage access+refresh, existing refresh interceptor |
| TypeScript | `allowJs` tsconfig; primitives copied as `.tsx`, pages stay `.jsx` | Primitives stay byte-diffable against the CRM; no app-wide TS migration in the same pass |
| Sidebar nav | Grouped CRM-style, 9 items | Matches the CRM's IA without new screens |
| Router | Stays react-router-dom **v7 declarative** | The CRM's v8 data router would churn `App.jsx` for nothing |

### Open question — brand hue

Adopting the CRM's token block verbatim **re-brands this app from indigo to violet**. That is what "match the CRM" means and is the default here. If indigo should be kept, it is a one-line override in both `:root` and `.dark`:

```css
--primary: oklch(0.511 0.262 276.966);   /* indigo #4f46e5 */
```

Worth deciding before Phase 1 lands — reversing it later is trivial, but *noticing* it later is a surprise.

## Architecture after conversion

```
src/
  index.css                  the design system (CRM token block, verbatim, + a fenced academy-only block)
  App.jsx                    ThemeProvider (next-themes) + Toaster + BrowserRouter + Routes  [13 routes UNCHANGED]
  app/
    navigation.js            NAV_GROUPS — 9 items, grouped, lucide icons
    auth.js                  login / logout / getStoredUser
    theme-provider.jsx       next-themes passthrough
    layout/
      app-sidebar.jsx        nav + brand + rail
      app-header.jsx         h-14: trigger, breadcrumb, ⌘K, theme toggle, avatar menu
  components/
    ui/                      ~30 shadcn base-nova primitives, .tsx, vendored from the CRM
    common/                  10 existing primitives (internals swapped, prop APIs preserved) + 3 new adapters
    Layout.jsx               ~35 lines: SidebarProvider + AppSidebar + SidebarInset + AppHeader + main
    ProtectedRoute.jsx       UNCHANGED (14 lines, zero MUI)
    *.jsx                    41 feature components, restyled in place
  pages/                     13 pages, restyled in place
  api/                       10 files, UNCHANGED
  hooks/
    use-mobile.ts            768px hook that sidebar.tsx requires
    use-current-user.js
  lib/utils.js               cn, formatINR, formatDate, formatDateTime, initials
  utils/formErrors.js        UNCHANGED — still drives all inline field validation
```

Deleted: `src/theme.js`.

## The biggest lever: `common/` prop APIs are preserved

The 10 `src/components/common/` primitives have **framework-neutral** prop signatures — verified by reading them:

```
PageHeader  ({ title, subtitle, meta, back, action })
FormDialog  ({ open, onClose, title, subtitle, submitLabel, cancelLabel,
               onSubmit, saving, loading, formError, maxWidth, children })
FormSection ({ title, description, columns, children })
FilterBar   ({ children })
TableCard   ({ children, sx })
```

Rewriting their **internals** restyles ~45 consumer files without touching a call site.

> **Correction to an earlier draft:** `TableCard`'s `sx` prop has **zero call sites** — all 12 usages are a bare `<TableCard>`. The prop is simply dropped. There is **no prop-name churn anywhere in this migration.**

| File | Action |
|---|---|
| `PageHeader.jsx` | → CRM `page-header` markup. Keeps `back` (ghost Button + `ArrowLeft`) and `meta` (Badge row), which the CRM's version lacks. **Drop its `mb`** — the shell's `gap-4` owns rhythm now |
| `FormDialog.jsx` | → CRM `Dialog`; footer becomes `-mx-4 -mb-4 border-t bg-muted/50 p-4`. `maxWidth` `xs\|sm\|md\|lg` → `sm:max-w-md\|lg\|2xl\|4xl`, plus `max-h-[85svh] overflow-y-auto` (replacing MUI's `scroll="paper"`). Guard close-while-saving via `onOpenChange` |
| `FormSection.jsx` | → `grid gap-5` + `grid-cols-1 sm:grid-cols-2 lg:grid-cols-{3,4}`; sibling divider → `[&+&]:mt-6 [&+&]:border-t [&+&]:pt-6`. **Grep for `gridColumn: "1 / -1"`** — those full-width escapes become `className="sm:col-span-2 lg:col-span-3"` |
| `FilterBar.jsx` | → `flex flex-wrap items-center gap-2`. Controls normalise to **h-8**, not 48px. See note below |
| `TableCard.jsx` | → `overflow-hidden rounded-xl border`. Drop `sx`. No `TableContainer` needed — the CRM's `Table` already self-wraps in `overflow-x-auto` |
| `LoadingButton.jsx` | → `Button` + `Spinner`. Keep the MUI-shaped props and map internally: `contained+primary→default`, `contained+error→destructive`, `outlined→outline`, `text`/`color="inherit"`→`ghost`, `fullWidth→w-full` |
| `ConfirmDialog.jsx` | → CRM `alert-dialog`. Same props (`confirmColor==="error"` → `destructive`) |
| `SnackbarAlert.jsx` | → `() => null`, deleted in the final sweep |
| `useSnackbar.js` | Body reimplemented over **sonner**; return shape `{snackbar, showSnackbar, closeSnackbar}` preserved so 12 consumers compile unchanged |
| `useConfirm.js` | **Byte-for-byte unchanged** — pure state, zero MUI |

**`FilterBar` is a real design decision, not a mapping.** The CRM's equivalent (`data-table-toolbar.tsx`) is a *bare flex row*, not a bordered card. Adopting that — the recommendation, since it is what "match the CRM" means — removes a visible box from 7 screens. If the box should stay, `rounded-xl border bg-card p-3` reproduces it inside the token system.

### Three new adapters (the second-biggest lever)

The 23 `<TextField>` and 23 `<TextField select>`/`<MenuItem>` sites across 7 filter bars and 11 form dialogs are the bulk of the remaining work. Every academy form uses `handleChange(event)` reading `event.target.name`. Base UI's `Select` is `value`/`onValueChange`. Rather than rewrite ~40 handlers:

- **`common/FormField.jsx`** — `{label, name, value, onChange, error, helperText, required, type, multiline, rows, placeholder, disabled}` → `Field`/`FieldLabel`/`Input`-or-`Textarea`/`FieldError`, passing `name` through and calling `onChange(event)` natively.
- **`common/FormSelect.jsx`** — same, plus `options`. Synthesises `onChange({ target: { name, value } })` so existing handlers work verbatim. Base UI's `SelectRoot` does render a hidden `<input name=…>`, so `formErrors.js`'s `focusFirstError` (which queries `[name="…"]` and skips `type === "hidden"`) behaves exactly as it does today.
  - **Gotcha handled here, once:** every filter uses `""` for "All Courses"/"All Status". Base UI treats `""` as a real value and would render an empty-labelled item. `FormSelect` translates `"" ↔ "__all__"` at its boundary so the 7 filter bars keep `""` in state and their `params.course !== ""` guards stay correct.
- **`common/StatusBadge.jsx`** — see *Tokenizing* below.

With these, each form dialog becomes a mechanical `TextField`→`FormField`, `TextField select`→`FormSelect`, `MenuItem`→`SelectItem` rename, and `utils/formErrors.js` keeps working untouched.

## Dependencies

Pinned to the CRM's resolved versions so vendored `.tsx` stays byte-compatible. This project uses **npm** (`package-lock.json`).

```
npm i @base-ui/react@1.6.0 lucide-react@1.28.0 \
      class-variance-authority@0.7.1 clsx@2.1.1 tailwind-merge@3.6.0 \
      tw-animate-css@1.4.0 @fontsource-variable/geist@5.3.0 \
      shadcn@4.16.1 next-themes@0.4.6 cmdk@1.1.1 sonner@2.0.7 \
      react-hook-form@7.84.0 zod@4.4.3 @hookform/resolvers@5.5.7

npm i -D tailwindcss@4.3.3 @tailwindcss/vite@4.3.3 typescript@~5.9.3
```

- **`shadcn` is a runtime dependency, not a CLI-only devDep.** `index.css` does `@import "shadcn/tailwind.css"`, which is where the `data-open` / `data-closed` / `data-checked` / `data-disabled` / `data-active` custom variants and the `no-scrollbar` / `scroll-fade*` / `shimmer*` utilities live. **Without it every such class in the vendored primitives silently no-ops** — dialogs, dropdowns, selects and the sidebar look almost right but never animate and lose disabled/checked styling. Nothing errors. Put a comment in `index.css` saying so.
- `react-hook-form` + `zod` + resolvers are for the **login page only**. The 11 form dialogs keep `utils/formErrors.js`.
- `cmdk` transitively pulls a few small `@radix-ui/*` packages. That is internal to cmdk; nothing in our code imports Radix.
- `@base-ui/react` declares `date-fns` / `@date-fns/tz` as peers but marks both `optional: true`, and we skip `calendar.tsx` — so **no `date-fns` needed**.
- `typescript` is for the editor and an optional `tsc --noEmit`. **Do not add `tsc -b` to `build`** — keep `"build": "vite build"`.

**Do not add:** `react-day-picker`, `embla-carousel-react`, `input-otp`, `recharts`, `react-resizable-panels`, `@tanstack/react-table`, `@tanstack/react-query`, `date-fns`, `@dnd-kit/*`.

**Remove last, not first:** `npm rm @mui/material @mui/icons-material @emotion/react @emotion/styled`.

## Which shadcn primitives to vendor

Copy **verbatim as `.tsx`** into `src/components/ui/`. No file in `components/ui/` imports a router, so decision 8's `react-router` → `react-router-dom` rewrite applies only to files we author.

**Shell (11):** `sidebar` · `sheet` · `tooltip` · `skeleton` · `separator` · `button` · `input` · `breadcrumb` · `avatar` · `dropdown-menu` · `command`
*`sidebar` requires button/input/separator/sheet/skeleton/tooltip + `hooks/use-mobile`. `command` requires `dialog` and `input-group`; `input-group` requires button/input/`textarea`.*

**Page surface (12):** `table` · `card` · `badge` · `dialog` · `alert-dialog` · `alert` · `select` · `field` · `label` · `textarea` · `input-group` · `tabs`

**Small, high-leverage (6):** `sonner` · `spinner` (replaces all 19 `CircularProgress`) · `empty` · `checkbox` · `switch` · `progress` (`BatchOverview`'s `LinearProgress`)

**Total ~29 files, ~2,600 LOC of vendored, never-hand-edited code.** Plus `hooks/use-mobile.ts` and the CRM's `assets/login-bg.jpg`.

**Do not copy:** `accordion` `aspect-ratio` `calendar` `carousel` `chart` `collapsible` `combobox` `context-menu` `drawer` `hover-card` `input-otp` `navigation-menu` `pagination` `popover` `radio-group` `resizable` `scroll-area` `toggle` `toggle-group`, and all of `components/data-table/*`.

> **Not `ui/pagination.tsx`.** It is a numbered page-link control **the CRM itself never renders**. The CRM's actual pagination is `data-table-pagination.tsx`: `Showing X–Y of N` + a `<Button variant="outline" size="sm">` Prev/Next pair. Reproduce *that* in `StudentPagination.jsx` / `PaymentPagination.jsx` (~25 lines each). Copying `ui/pagination.tsx` would introduce a control the CRM does not have.

## Config

| File | Change |
|---|---|
| `tsconfig.json` | **New, single file** (not the CRM's 3-file project-references setup): `allowJs: true`, `checkJs: false`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `verbatimModuleSyntax: true`, `isolatedModules`, `noEmit`, `skipLibCheck`, `baseUrl: "."`, `paths: {"@/*": ["./src/*"]}`. **`verbatimModuleSyntax` matters** — the vendored files use `import { cva, type VariantProps }`. Do **not** copy the CRM's `noUnusedLocals`/`noUnusedParameters`/`erasableSyntaxOnly`; over 55 loose `.jsx` files they are pure noise |
| `vite.config.js` | Add `tailwindcss()` + the `@` alias. **Keep `build.outDir: "build"` and `server.allowedHosts`** |
| `src/index.css` | Replace the 17-line reset with the CRM's 131 lines verbatim, then append one fenced academy-only token block (below) |
| `src/lib/utils.js` | The CRM's five helpers, written as `.js` (app code, not a vendored primitive) |
| `.oxlintrc.json` | Add `"typescript"` to `plugins` so `.tsx` is linted rather than mis-parsed (the CRM's config does exactly this) |
| `src/App.jsx` | Drop MUI `ThemeProvider`/`CssBaseline`/`theme`; wrap in next-themes `ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange` + `<Toaster richColors position="top-right" />`. **The 13-route `<Routes>` block is copied across character-for-character** |

> ⚠️ **`__dirname` does not exist in this project.** `vite.config.js` is `.js` under `"type": "module"`, so the CRM's `path.resolve(__dirname, './src')` would throw at config load. Use:
> ```js
> import { fileURLToPath, URL } from 'node:url'
> resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
> ```
> This also removes any need for `@types/node`.

### Killing `theme.js`

**11 importers** (not the 5 or 9 reported by earlier surveys — verified recursively; `src/components/common/` sits two levels deep and is easy to miss):

- `layout` → `PageHeader`, `FilterBar`, `FormSection`, `BatchStudents`, `BatchView`, `BatchOverview`, `CourseProgress`
- `surfaceCard` → `FilterBar`, `TableCard`, `StudentPayments`, `Dashboard`
- `colors` → `BatchOverview`, `CourseProgress` — **live, not a dead export**
- `default` → `App.jsx`

| `theme.js` | Tailwind equivalent |
|---|---|
| `layout.pageHeaderGap: 4` | the shell's `gap-4`; drop `PageHeader`'s `mb` entirely |
| `layout.blockGap: 3` | `gap-3` |
| `layout.sectionGap: 4` | `gap-6` |
| `layout.fieldGap: 2.5` | `gap-5` (matches `FieldGroup`'s built-in) |
| `layout.controlHeight: 48` | **drop** — CRM controls are `h-8`; forcing 48px breaks the match |
| `surfaceCard` | `rounded-xl border bg-card` (tables) / `<Card>` (panels) |

Delete the file only once all 11 importers are converted.

## Shell

`Layout.jsx`: 498 lines → ~35.

```jsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <AppHeader user={user} onLogout={handleLogout} />
    <main className="flex flex-1 flex-col gap-4 p-4 md:p-6"><Outlet /></main>
  </SidebarInset>
</SidebarProvider>
```

Inherited free: 16rem ↔ 3rem rail, `Ctrl/Cmd+B`, `sidebar_state` cookie, `SidebarRail`, and a Sheet drawer below 768px — this app has **no** mobile drawer today.

### Navigation — 9 items, grouped

| Group | Items |
|---|---|
| *(ungrouped)* | Dashboard `/dashboard` — `LayoutDashboard` |
| ENQUIRIES | Enquiries `/enquiries` — `PhoneCall` |
| STUDENTS | Students `/students` — `GraduationCap` · Internships `/internships` — `Users` |
| PAYMENTS | Payments `/payments` — `CreditCard` |
| LEARNING | Courses `/courses` — `Library` · Batches `/batches` — `ListOrdered` |
| MEDIA | Events `/events` — `CalendarDays` · Gallery `/gallery` — `Images` |

Icons mirror the CRM's for the equivalent screens. Only deviation: Courses uses `Library` (the CRM's Curricula icon) so it stays distinguishable from Students' `GraduationCap`.

**Two differences from the CRM to handle:**
- Dashboard is at `/dashboard`, not `/`. `pageTitleForPath` must drop the `"/" → Dashboard` special case and use longest-prefix matching, so `/courses/7` → "Courses", `/batches/3` → "Batches", `/students/9/progress` → "Students".
- Active state becomes **longest-prefix**, not `===`. The current exact-match means detail pages have no lit nav item — a free fix via `SidebarMenuButton`'s `isActive`.

**Logout moves out of the sidebar** into the header menu.

### Sourcing the header user

> **Verified against the backend in this workspace** (`Cignes CRM\cignes_academy_web\…\cignes_academy_web-backend\accounts\urls.py`):
> ```python
> path("auth/login/",   TokenObtainPairView.as_view())   # stock SimpleJWT → {access, refresh} ONLY
> path("auth/refresh/", TokenRefreshView.as_view())
> path("auth/profile/", AdminProfileView.as_view())      # ← the user object
> ```
> `AdminProfileView` returns `{id, username, email, first_name, last_name, is_staff, is_superuser}`.
>
> **The login response carries no user object**, so the avatar must come from `auth/profile/`. Note this local snapshot's login is stock `TokenObtainPairView` (expects `username`), while the deployed host accepts `login_identifier` — the checked-in backend is behind the deployment. **Do not "fix" the frontend payload to match this snapshot.**

`src/app/auth.js`:
- `login()` — POST `auth/login/` `{login_identifier, password}` *(unchanged contract)*, store `access`+`refresh`, then **best-effort** `GET auth/profile/` cached to `localStorage.user` as `{full_name, email, username}` where `full_name = [first_name, last_name].filter(Boolean).join(" ") || username`. **Login must never fail because profile failed.**
- `logout()` — clear `access`, `refresh`, `user` → `navigate("/")`.
- Fallback when profile 404s/errors: `{full_name: "Admin", email: ""}` → avatar `A`, no email line.

Also add the `user` key to the cleanup in `api/axios.js`'s 401-refresh-failure path, which currently clears only the two tokens.

## Login

Rebuilt to match `Cignes CRM/frontend/src/components/auth/login-page.tsx` exactly — `relative grid min-h-svh lg:grid-cols-2`; left half full-bleed `login-bg.jpg` under `bg-gradient-to-t from-black/80 via-black/30 to-black/10` with the white logo tile, "Cignes Academy", **"Learn AI. Create Impact."** and "Manage enquiries, enrollments, fees and events from one place."; right half `bg-muted/40` centring a `Card` at `max-w-sm` with the mobile-only `size-11 rounded-xl` tile, `FieldGroup` of **Email or phone** + **Password**, zod validation, destructive `Alert`, and a submit button that swaps to `<LoaderCircle className="animate-spin" />` + "Signing in…".

**Auth wiring untouched** — `api.post("auth/login/", { login_identifier: identifier, password })`, localStorage access+refresh, `navigate("/dashboard")`. Only the *label* reads "Email or phone".

> **Asset weight:** the CRM's `login-bg.jpg` is **1.24 MB** and this app's `logo-cignes.png` is **1.36 MB** for a 32px tile. Compress both before committing — the background is the first byte a user waits on.

## Tokenizing the hardcoded hexes

~80 hex literals, 35 distinct values, in five buckets. Required for dark mode, not cosmetic.

**1 · Neutrals (~30).** `#111827`/`#374151` → `text-foreground`; `#4b5563`/`#6b7280` → `text-muted-foreground`; `#9ca3af` → `text-muted-foreground/70`; `#e5e7eb`/`#d1d5db` → `border`; `#f5f7fb` (canvas) → **delete**, `body` is `bg-background`; `#1f2937` → gone with the drawer.

> `#f9fafb`/`#fafafa` row-hover and table-head fills → **delete outright.** `TableRow` already ships `hover:bg-muted/50`. This is the single biggest dark-mode fix: today's `"&:hover": { backgroundColor: "#fafafa" }` is an invisible white-on-white hover in dark mode.

**2 · Brand indigo (~12).** `#4f46e5`/`#4338ca`/`#818cf8` → `text-primary`; `#eef2ff` and `#e8eaf6` (avatar + icon-tile fills, same intent) → unify to `bg-primary/10 text-primary`.

**3 · Status chips (~14 hexes + 29 MUI `color="success|warning"` Chips).** The CRM's `Badge` has only `default | secondary | destructive | outline | ghost | link` — **no success, no warning.** So:

Append to `index.css`, in a clearly fenced academy-only section so the CRM portion stays a clean diff:
```css
:root { --success: oklch(0.63 0.15 149); --warning: oklch(0.72 0.17 70); }
.dark { --success: oklch(0.70 0.15 149); --warning: oklch(0.78 0.16 70); }
```
registered in `@theme inline` as `--color-success` / `--color-warning`.

Then add **`common/StatusBadge.jsx`** — one lookup mapping every status the app knows to a variant, replacing five separate `getXStatusColor` switches: `ACTIVE`/`PAID`/active → success · `COMPLETED` → default · `PARTIAL`/`ON_HOLD` → warning · `DROPPED`/`PENDING`/inactive → destructive · unknown → secondary. It applies the success/warning tints via `className` on `<Badge variant="secondary">`, **so no vendored primitive is hand-edited.**

**4 · Dashboard's 8 stat accents.** `#4F46E5 #10B981 #F59E0B #EC4899 #EF4444 #06B6D4 #7C3AED #059669`, each used as icon colour + `${color}15` tile fill.

> **Recommendation: drop all eight.** Render every tile as `<Card>` with `<div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">` — the treatment `empty.tsx`'s `EmptyMedia variant="icon"` uses. The CRM's own `--chart-1..5` are **five greys**; it deliberately has no rainbow. Eight arbitrary hues is the most "not the CRM" thing on the screen. Also drop the `boxShadow: "0 8px 20px rgba(0,0,0,.08)"` hover lift here and on `StudentCards` — CRM cards are flat `ring-1`, no shadow.
>
> This is the one genuine design decision in the conversion. Flagging rather than deciding silently.

**5 · `theme.js`'s own 12** — deleted with the file.

## Dark mode

What actually breaks, in likely-severity order:

1. **Surviving hex literals** — a white-on-white hover or black-on-black label. **Hard gate:** after every batch, `rg '#[0-9a-fA-F]{3,8}\b' src/ --glob '!src/index.css'` must be empty.
2. **Literal `bg-white`.** Exactly three legitimate uses survive (the logo tiles, white-backed on purpose because the logo is dark-on-transparent). Everything else → `bg-card`/`bg-background`/`bg-popover`. Check with `rg 'bg-white|text-black|text-white' src/`.
3. **Transparent-background images** — course/event/gallery thumbs currently sit on `#eef2ff`; make it `bg-muted`, which flips.
4. **Theme toggle Sun/Moon** relies on `dark:hidden` / `hidden dark:block`, which needs both `@custom-variant dark` in `index.css` **and** `attribute="class"` on the provider. Miss either and both icons stack — an instant visual tell.
5. **FOUC on reload.** `next-themes` in a plain Vite SPA has no SSR script; expect a one-frame flash. The CRM has the identical behaviour. Accept it.
6. Sonner reads `useTheme()` internally — nothing to do.

**Procedure:** after each batch, load the changed screen and toggle Light → Dark → System. Anything that does not change is either correct (images) or hardcoded (bug). Test with the OS in dark mode too, so "System" resolves to dark.

## Verification

```bash
npm run build        # vite build → build/   (must stay green THROUGHOUT)
npm run lint         # oxlint
npx tsc --noEmit     # optional; only meaningful for the vendored .tsx
```

Grep gates:
```
rg '#[0-9a-fA-F]{3,8}\b' src/ --glob '!src/index.css'   # must be empty
rg 'from "@mui' src/                                     # monotonically decreasing → 0
rg '\bsx=\{' src/                                        # monotonically decreasing → 0
rg 'from "\.\.?[./]*theme"' src/                          # → 0
```

**Side-by-side against the running CRM** (`cd "Cignes CRM/frontend" && pnpm dev`), same viewport. These six are where a Tailwind port drifts:

1. **Sidebar** — group-label typography + `capitalize`, item height, collapsed 3rem rail, the `bg-sidebar` seam.
2. **Header** — exactly `h-14`, `border-b`, `gap-3`, separator at `h-4`, four right-hand controls at `size="icon"` (32px).
3. **Table head** — `h-10 px-2 font-medium text-foreground`: **not uppercase, not letter-spaced, not grey.** This app's `MuiTableCell.head` override is uppercase/tracked/`#6b7280` and must not survive.
4. **Button** — default is **`h-8`**, not 48px. The `size="large"` + `controlHeight: 48` habit must go. Verify `data-icon="inline-start"` is present on every icon+label button — it is **load-bearing**, driving `has-data-[icon=inline-start]:pl-2` padding, not decoration.
5. **Card** — `rounded-xl`, `ring-1 ring-foreground/10` (a *ring*, not a border), no shadow.
6. **Dialog** — `rounded-xl bg-popover p-4`; the `-mx-4 -mb-4 border-t bg-muted/50` footer bar is distinctive and easy to miss.

**Functional smoke test** (after the shell phase and again at the end): login → dashboard → all 9 nav items → the 4 unlisted detail routes → open and save one form per module → delete something (confirm + toast) → ⌘K to each screen → toggle theme → collapse sidebar and reload (cookie persists) → resize below 768px → let the access token expire and confirm the 401→refresh interceptor still round-trips.

## Risks and ordering hazards

1. **Do not `npm rm @mui/*` until the last MUI import is gone.** MUI and Tailwind coexist fine. Removing MUI early breaks the build for the entire middle of the project and destroys batch-by-batch verification.
2. **`theme.js` must outlive every one of its 11 importers.** Deleting it while `Dashboard.jsx` or `CourseProgress.jsx` still imports `surfaceCard`/`colors` fails the build.
3. **Replacing `index.css` removes the `box-sizing` reset while `<CssBaseline/>` is still mounted.** Tailwind preflight supplies it but also resets headings, lists and `img` — briefly doubling up with MUI's reset. Remove `<CssBaseline/>` in the **same commit** as the CSS swap.
4. **Land `tsconfig.json` + the vite alias *before* the 29 `.tsx` files**, or the editor lights up red and esbuild may miss JSX mode.
5. **`sm:max-w-sm` is `DialogContent`'s default.** These are `maxWidth="md"` multi-column forms — forget the `maxWidth` map in `FormDialog` and all 11 forms become 384px wide and unusable. Test one wide form immediately.
6. **Prettier conflict.** The CRM is `semi: false, singleQuote: false, printWidth: 100`; this codebase is semicolon'd and hand-wrapped ~40 cols. **Do not reformat the repo** — it would destroy the diff. Optionally scope the CRM's `.prettierrc` to `src/components/ui/**` so vendored files stay format-identical.
7. **`build/` is committed** despite being gitignored (`git status` shows `M build/index.html`). Decide up front whether to `git rm -r --cached build`, or every review diff is polluted.
8. **`CourseProgress.jsx` (652), `Curriculum.jsx` (686), `StudentPayments.jsx` (682), `StudentForm.jsx` (733), `Enquiries.jsx` (756)** are the five files most likely to overrun. Schedule room.
9. **lucide v1.28 keeps both old and new icon names** — `MoreVertical` and `EllipsisVertical`, `PlayCircle` and `CirclePlay` all resolve. Verified; no renaming risk.
10. `assets/hero.png`, `react.svg`, `vite.svg` appear unused — delete in the final sweep after a grep.

## Conventions once converted

- Class strings come from the CRM. When in doubt, open the CRM's equivalent and copy rather than invent.
- Leading icons in buttons get `data-icon="inline-start"`.
- `destructive` buttons are **tinted** (`bg-destructive/10 text-destructive`), not solid red.
- Cards and popovers use `ring-1 ring-foreground/10`, not `border`.
- Never hardcode a colour — add a token or use an existing one.
- `components/ui/` is **vendored**: treat as read-only, re-copy from the CRM to update.
