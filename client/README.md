# ShelfLife - Frontend Client

A typed React + TypeScript web application built with **Vite** for the ShelfLife college library management platform.

---

## 🎨 Color Palette & Design System

The application strictly adheres to the requested color palette with **no gradient effects anywhere**:

- `--color-palette-1`: `#092328` (Deep dark teal - text, dark accents, overdue badge)
- `--color-palette-2`: `#12544F` (Forest teal - navbar, table headers, primary buttons)
- `--color-palette-3`: `#2A835F` (Vibrant emerald - button hover, active links, primary highlights)
- `--color-palette-4`: `#8BBB92` (Sage - borders, subtle tags, available badges)

All palette colors are defined as reusable CSS custom properties in [`src/index.css`](file:///d:/projects/sem-4-fsd-project/client/src/index.css).

---

## 🏗️ Component & Folder Architecture

```text
client/
├── public/                   # Static assets
├── src/
│   ├── api/
│   │   └── client.ts         # Typed API client for all backend endpoints & JWT token management
│   ├── components/
│   │   ├── DataTable.tsx     # Generic typed <DataTable<T>> component
│   │   ├── Select.tsx        # Generic typed <Select<T>> dropdown component
│   │   ├── Navbar.tsx        # Responsive navigation bar & auth status
│   │   └── ProtectedRoute.tsx# Client-side route protection guard
│   ├── context/
│   │   └── AuthContext.tsx   # React Context for librarian auth state
│   ├── pages/
│   │   ├── BookListPage.tsx  # Book catalog with search, genre filter, and add book
│   │   ├── IssueBookPage.tsx # Issue book form with member/book generic select & toasts
│   │   ├── MemberHistoryPage.tsx # Member borrow history with overdue badges & return action
│   │   └── LoginPage.tsx     # Librarian sign in page
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces for Book, Member, BorrowRecord, and APIs
│   ├── App.tsx               # Route definitions and application layout
│   ├── index.css             # Design tokens and styles (no gradients)
│   └── main.tsx              # Vite React entry point
├── package.json
├── tsconfig.json
└── vite.config.ts            # Vite config with dev proxy to backend port 5000
```

---

## 🧠 State Management Decision Note

### Choice: React Context + Component Local State (`useState` / `useEffect`)

For ShelfLife, we deliberately chose a hybrid approach combining **React Context** for global authentication with **Local State** for domain-specific views, rather than introducing an external state management library (such as Redux, Zustand, or MobX).

### Why:
1. **Scope & Single Responsibility**: Authentication state (`token`, `isAuthenticated`, `login`, `logout`) is the only state truly shared globally across routing and the header. Wrapping this in `AuthContext` provides a clean, single source of truth without prop drilling.
2. **Encapsulated Page Lifecycles**: Book browsing, filtering, book issuing, and member history are scoped to their respective pages. Managing them via local state ensures automatic garbage collection on unmount, avoiding stale cache issues across librarian sessions.
3. **Minimal Overhead & High Maintainability**: Incorporating Redux or complex global stores for an application of this scope would introduce extensive boilerplate (actions, reducers, selectors, dispatchers) without functional benefit. React's native primitives keep the bundle lightweight, the code readable, and maintenance straightforward.

---

## 🚀 Setup & Running Locally

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The Vite development server will start at `http://localhost:3000` with requests to `/api` automatically proxied to the backend at `http://localhost:5000`.

### 3. Build for Production
```bash
npm run build
```
Type checks and bundles the app into `dist/`.
