# ShelfLife - College Library Management Platform

A full-stack library management platform for college libraries to manage books, members, and borrowing workflows.

- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication, Joi Validation (in [`server/`](file:///d:/projects/sem-4-fsd-project/server))
- **Frontend**: React 18+, TypeScript, Vite, React Router (in [`client/`](file:///d:/projects/sem-4-fsd-project/client))

---

## 🎨 UI & Design Palette (Frontend)

The frontend strictly implements the requested color palette with **no gradient effects anywhere**:

| Color Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| `palette-1` | `#092328` | Deep dark teal: text headings, overdue badges, active buttons |
| `palette-2` | `#12544F` | Forest teal: navbar, table header, primary buttons |
| `palette-3` | `#2A835F` | Emerald green: hover states, active navigation links, highlights |
| `palette-4` | `#8BBB92` | Sage green: borders, available badges, subtle indicators |

All variables are defined in [`client/src/index.css`](file:///d:/projects/sem-4-fsd-project/client/src/index.css).

---

## 📁 Repository Structure

```text
sem-4-fsd-project/
├── client/                   # React + TypeScript (Vite) Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts     # Typed API client for all backend endpoints
│   │   ├── components/
│   │   │   ├── DataTable.tsx # Generic typed <DataTable<T>> component
│   │   │   ├── Select.tsx    # Generic typed <Select<T>> dropdown component
│   │   │   ├── Navbar.tsx    # Responsive navigation bar & auth indicator
│   │   │   └── ProtectedRoute.tsx # Route protection guard
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Context for librarian auth state
│   │   ├── pages/
│   │   │   ├── BookListPage.tsx  # Book list with search, genre filter, add book
│   │   │   ├── IssueBookPage.tsx # Issue book form with generic selects & toast
│   │   │   ├── MemberHistoryPage.tsx # Member borrow history with overdue badges
│   │   │   └── LoginPage.tsx     # Librarian sign in page
│   │   ├── types/
│   │   │   └── index.ts      # TypeScript interfaces (Book, Member, BorrowRecord)
│   │   ├── App.tsx           # Route setup
│   │   ├── index.css         # Styling system (strictly palette colors, no gradients)
│   │   └── main.tsx          # App entry point
│   ├── package.json
│   └── vite.config.ts        # Vite config with API proxy
│
└── server/                   # Node.js + Express + Mongoose Backend
    ├── config/db.js          # MongoDB connection
    ├── controllers/          # Controllers (auth, book, member, borrow)
    ├── middleware/           # Auth, logger, validators, centralized error handler
    ├── models/               # Mongoose schemas (Book, Member, BorrowRecord)
    ├── routes/               # Express route definitions
    ├── .env.example          # Environment variables template
    ├── app.js                # Express app setup
    ├── server.js             # Server startup
    └── package.json
```

---

## 🧠 State Management Decision Note

### Choice: React Context + Component Local State (`useState` / `useEffect`)

For ShelfLife's frontend architecture, we adopted a hybrid model combining **React Context** for global authentication with **Local State** for view-specific lifecycles, intentionally omitting heavyweight external state libraries (e.g. Redux or Zustand).

### Why:
1. **Appropriate Scoping**: Authentication (`token`, `isAuthenticated`, `login`, `logout`) is the sole cross-cutting concern requiring application-wide access. Centralizing this within `AuthContext` ensures a single source of truth without prop drilling.
2. **Encapsulated View Lifecycles**: Book catalog searching/filtering, the issue book form, and member borrow history belong to their respective pages. Keeping them in local state prevents stale state bugs across different user actions and enables automatic cleanup on unmount.
3. **No Redundant Overhead**: Introducing an external state management library for this application would introduce boilerplate (actions, dispatchers, reducers) without tangible benefits. React's native state primitives keep bundle size minimal, improve code readability, and simplify maintenance.

---

## ⚡ Race Condition Prevention Note

### Problem:
When two librarians issue the last copy (`availableCopies: 1`) of the same book at the exact same moment, standard read-then-write logic (`if (copies > 0) copies--`) results in a race condition where both check pass, decreasing stock to `-1` (overselling).

### Solution:
As implemented in [`server/controllers/borrowController.js`](file:///d:/projects/sem-4-fsd-project/server/controllers/borrowController.js):
```javascript
// 1. Avoid separate read-then-write checks (e.g. if copies > 0 then save) because concurrent requests can interleave.
// 2. Instead, use an atomic conditional update: Book.findOneAndUpdate({ _id: id, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } }).
// 3. MongoDB executes document-level updates atomically under internal write locks, serializing simultaneous attempts.
// 4. If two librarians issue the last copy simultaneously, only the first request matches the query; the second receives null.
// 5. This guarantees availableCopies never drops below 0 and eliminates race conditions without distributed locks.
```

---

## 🚀 Running the Project

### Backend:
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

### Frontend:
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:3000
```
Default Librarian credentials:
- Email: `librarian@shelflife.edu`
- Password: `Librarian@123`
