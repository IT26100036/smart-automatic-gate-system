# Smart Gate Admin — Web App

Admin dashboard for the Smart Gate parking management system. Built with React 19 + Vite, Material UI, and Chart.js.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + Vite 8 |
| UI | Material UI v9 (MUI) + Emotion |
| Icons | MUI Icons · Tabler Icons (React + CDN webfont) |
| Routing | React Router DOM v7 |
| HTTP | Axios (JWT interceptor) |
| Charts | Chart.js v4 + react-chartjs-2 |
| Dates | dayjs |

---

## Project Structure

```
src/
├── api/
│   └── axios.js           # Axios instance — baseURL, JWT interceptor, 401 redirect
├── context/
│   ├── AuthContext.jsx    # user/token state, login(), logout()
│   └── ThemeContext.jsx   # light/dark theme toggle (MUI ThemeProvider)
├── hooks/
│   ├── useLiveTime.js     # live Date updated every second via setInterval
│   └── useSlots.js        # polls GET /api/parking/slots every 5 s
├── components/
│   ├── Layout.jsx         # AppBar (live clock) + Sidebar + <Outlet>
│   ├── Sidebar.jsx        # permanent drawer, NavLink active = orange
│   ├── ProtectedRoute.jsx # redirects to /login if no token
│   ├── StatCard.jsx       # label / value / trend / orange icon badge
│   ├── SlotGrid.jsx       # MUI Grid of slot cards (green free / red occupied)
│   ├── ActivityFeed.jsx   # entry/exit list (orange / green avatars)
│   └── Badge.jsx          # MUI Chip wrapper
└── pages/
    ├── Login.jsx          # email + password → AuthContext.login()
    ├── Dashboard.jsx      # stats × 4, SlotGrid, ActivityFeed, revenue bar chart
    ├── Slots.jsx          # SlotGrid + occupants table with live estimated charge
    ├── Analytics.jsx      # range selector, 5 charts (line/bar/doughnut), 4 stat cards
    ├── Logs.jsx           # searchable/filterable table, CSV export
    ├── Clients.jsx        # client table + Add/Edit modal
    ├── Cards.jsx          # card table + Top Up modal + Deactivate confirm
    └── Settings.jsx       # admin account form + system health panel
```

---

## Routes

| Path | Access | Page |
|---|---|---|
| `/login` | Public | Login |
| `/` | Protected | → redirect to `/dashboard` |
| `/dashboard` | Protected | Dashboard |
| `/slots` | Protected | Slots |
| `/analytics` | Protected | Analytics |
| `/logs` | Protected | Logs |
| `/clients` | Protected | Clients |
| `/cards` | Protected | Cards |
| `/settings` | Protected | Settings |

---

## Environment Variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is the base URL of the backend REST API. The Axios instance reads this via `import.meta.env.VITE_API_URL`.

---

## Dev Setup

```bash
npm install
npm run dev        # starts Vite dev server at http://localhost:5173
```

> **Login is bypassed in development.** `AuthContext` seeds a mock user and token when `import.meta.env.DEV` is `true`, so you land directly on `/dashboard` without hitting the backend auth endpoint. Remove the `DEV` guard in `src/context/AuthContext.jsx` before production build.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

---

## API Endpoints Expected

| Method | Path | Used by |
|---|---|---|
| `POST` | `/api/auth/login` | Login page |
| `PUT` | `/api/auth/update` | Settings — account form |
| `GET` | `/api/parking/slots` | useSlots hook (polls every 5 s) |
| `GET` | `/api/parking/logs` | Dashboard, Analytics, Logs |
| `GET` | `/api/clients` | Clients page |
| `POST` | `/api/clients` | Clients — Add modal |
| `PUT` | `/api/clients/:id` | Clients — Edit modal |
| `GET` | `/api/cards` | Cards page |
| `PUT` | `/api/cards/:cardId/topup` | Cards — Top Up modal |
| `PUT` | `/api/cards/:cardId/deactivate` | Cards — Deactivate |
| `GET` | `/health` | Settings — system status panel |

---

## Theme

The app uses a MUI light theme by default. A dark/light toggle is wired up in `ThemeContext.jsx` — call `useThemeToggle()` to get `{ mode, toggleTheme }` and add an `<IconButton>` anywhere in the layout to expose it to users.

Orange brand colour: `#f97316` (MUI `primary.main`) · CSS custom property: `--or: #E8590C`.
