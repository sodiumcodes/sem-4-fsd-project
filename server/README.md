# ShelfLife - College Library Management Platform (Backend API)

ShelfLife is a robust, production-ready REST API backend for a college library management platform to manage books, members, and borrowing workflows. Built with **Node.js**, **Express**, and **Mongoose (MongoDB)**.

---

## 📁 Project Architecture & Folder Structure

The backend is housed inside the `server/` folder following the MVC/layered architecture:

```text
server/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   ├── authController.js     # Librarian authentication & JWT generation
│   ├── bookController.js     # Add book & paginated/filtered book catalog
│   ├── memberController.js   # Member registration & borrow history
│   └── borrowController.js   # Issue & return books (atomic race-condition-safe)
├── middleware/
│   ├── auth.js               # JWT verification & route protection
│   ├── errorHandler.js       # Centralized error handler (Joi, Mongoose, JWT, Mongo 11000)
│   ├── logger.js             # HTTP request logging via Morgan
│   └── validators.js         # Joi validation schemas and validation middleware
├── models/
│   ├── Book.js               # Book Mongoose schema (ISBN unique, copies >= 0)
│   ├── Member.js             # Member Mongoose schema (email unique, membershipId unique)
│   └── BorrowRecord.js       # BorrowRecord Mongoose schema (refs to Book & Member, enum status)
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   ├── bookRoutes.js         # /api/books routes
│   ├── memberRoutes.js       # /api/members routes
│   └── borrowRoutes.js       # /api/borrow & /api/return routes
├── .env                      # Local environment configuration
├── .env.example              # Environment variables template
├── app.js                    # Express app configuration & middleware pipeline
├── server.js                 # Server entry point
├── package.json              # Project dependencies and npm scripts
└── ShelfLife.postman_collection.json  # Exported Postman collection
```

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Node.js** (v18.x or later recommended; tested on v24)
- **MongoDB** instance running locally or via MongoDB Atlas

### 2. Install Dependencies
Navigate into the `server` directory and install the packages:
```bash
cd server
npm install
```

### 3. Environment Variables
Create a `.env` file inside the `server/` directory (you can copy `.env.example`):
```bash
cp .env.example .env
```

Configure your environment variables:
```env
# Server Port & Environment
PORT=5000
NODE_ENV=development

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/shelflife

# JWT Authentication
JWT_SECRET=shelflife_super_secret_jwt_key_2026
JWT_EXPIRES_IN=24h

# Librarian Credentials (Environment-based Authentication)
LIBRARIAN_EMAIL=librarian@shelflife.edu
LIBRARIAN_PASSWORD=Librarian@123
```

### 4. Run the Server
- **Production mode:**
  ```bash
  npm start
  ```
- **Development mode (with nodemon):**
  ```bash
  npm run dev
  ```

The server starts on `http://localhost:5000`.

---

## 🔒 Authentication & Route Protection

All write/modification endpoints (`POST /api/books`, `POST /api/members`, `POST /api/borrow`, `POST /api/return/:borrowId`) are protected with JWT authentication.
1. Authenticate at `POST /api/auth/login` using the librarian credentials defined in `.env`.
2. Attach the issued JWT token in the `Authorization` header as `Bearer <token>` for protected endpoints.

---

## 📋 API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates librarian with `.env` credentials and returns JWT. |
| `POST` | `/api/books` | Protected | Adds a new book to the library catalog. |
| `GET` | `/api/books` | Public | Lists books with pagination (`page`, `limit`) and genre filtering (`genre`). |
| `POST` | `/api/members` | Protected | Registers a new member with unique email and membershipId. |
| `POST` | `/api/borrow` | Protected | Issues a book to a member, decrements `availableCopies` atomically. |
| `POST` | `/api/return/:borrowId` | Protected | Marks book returned, increments `availableCopies`, and records `returnDate`. |
| `GET` | `/api/members/:id/history` | Public | Retrieves full borrowing history for a specific member. |
| `GET` | `/api/health` | Public | Server health status check. |

### Detailed Endpoint Specifications

#### 1. Librarian Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "librarian@shelflife.edu",
    "password": "Librarian@123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
  ```

#### 2. Add New Book
- **Endpoint**: `POST /api/books`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "ISBN": "978-0132350884",
    "genre": "Software Engineering",
    "totalCopies": 5,
    "availableCopies": 5
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Book added successfully",
    "data": {
      "_id": "651a2b3c4d5e6f7a8b9c0d1e",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "ISBN": "978-0132350884",
      "genre": "Software Engineering",
      "totalCopies": 5,
      "availableCopies": 5,
      "createdAt": "2026-10-05T10:00:00.000Z",
      "updatedAt": "2026-10-05T10:00:00.000Z"
    }
  }
  ```

#### 3. List Books (Pagination & Filtering)
- **Endpoint**: `GET /api/books?genre=Software Engineering&page=1&limit=10`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "count": 1,
    "total": 1,
    "page": 1,
    "totalPages": 1,
    "data": [
      {
        "_id": "651a2b3c4d5e6f7a8b9c0d1e",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "ISBN": "978-0132350884",
        "genre": "Software Engineering",
        "totalCopies": 5,
        "availableCopies": 5
      }
    ]
  }
  ```

#### 4. Register Member
- **Endpoint**: `POST /api/members`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Alice Johnson",
    "email": "alice.johnson@example.edu",
    "membershipId": "MEM-2026-001"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Member registered successfully",
    "data": {
      "_id": "651a2b3c4d5e6f7a8b9c0d2f",
      "name": "Alice Johnson",
      "email": "alice.johnson@example.edu",
      "membershipId": "MEM-2026-001",
      "joinedDate": "2026-10-05T10:00:00.000Z"
    }
  }
  ```

#### 5. Issue Book (Borrow)
- **Endpoint**: `POST /api/borrow`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "bookId": "651a2b3c4d5e6f7a8b9c0d1e",
    "memberId": "651a2b3c4d5e6f7a8b9c0d2f",
    "dueDate": "2026-10-25T18:30:00.000Z"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Book issued successfully",
    "data": {
      "_id": "651a2b3c4d5e6f7a8b9c0d3a",
      "book": "651a2b3c4d5e6f7a8b9c0d1e",
      "member": "651a2b3c4d5e6f7a8b9c0d2f",
      "issueDate": "2026-10-05T10:00:00.000Z",
      "dueDate": "2026-10-25T18:30:00.000Z",
      "returnDate": null,
      "status": "issued"
    },
    "bookAvailableCopies": 4
  }
  ```

#### 6. Return Book
- **Endpoint**: `POST /api/return/:borrowId`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Book returned successfully",
    "data": {
      "_id": "651a2b3c4d5e6f7a8b9c0d3a",
      "book": "651a2b3c4d5e6f7a8b9c0d1e",
      "member": "651a2b3c4d5e6f7a8b9c0d2f",
      "issueDate": "2026-10-05T10:00:00.000Z",
      "dueDate": "2026-10-25T18:30:00.000Z",
      "returnDate": "2026-10-10T12:00:00.000Z",
      "status": "returned"
    },
    "bookAvailableCopies": 5
  }
  ```

#### 7. Member Borrow History
- **Endpoint**: `GET /api/members/:id/history`
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "member": {
      "_id": "651a2b3c4d5e6f7a8b9c0d2f",
      "name": "Alice Johnson",
      "email": "alice.johnson@example.edu",
      "membershipId": "MEM-2026-001",
      "joinedDate": "2026-10-05T10:00:00.000Z"
    },
    "count": 1,
    "data": [
      {
        "_id": "651a2b3c4d5e6f7a8b9c0d3a",
        "book": {
          "_id": "651a2b3c4d5e6f7a8b9c0d1e",
          "title": "Clean Code",
          "author": "Robert C. Martin",
          "ISBN": "978-0132350884",
          "genre": "Software Engineering",
          "totalCopies": 5,
          "availableCopies": 5
        },
        "member": "651a2b3c4d5e6f7a8b9c0d2f",
        "issueDate": "2026-10-05T10:00:00.000Z",
        "dueDate": "2026-10-25T18:30:00.000Z",
        "returnDate": "2026-10-10T12:00:00.000Z",
        "status": "returned"
      }
    ]
  }
  ```

---

## ⚡ Race Condition Explanation

### The Problem
If two librarians attempt to issue the last remaining copy (`availableCopies: 1`) of a book at the exact same millisecond, a standard two-step read-then-write approach (`if (book.availableCopies > 0) { book.availableCopies--; await book.save(); }`) causes a critical race condition. Both concurrent requests read `availableCopies == 1`, both pass the conditional check, and both decrement the count, causing `availableCopies` to drop to `-1` (an illegal negative inventory state) and issuing two physical records for a single book copy.

### The Solution (Atomic Conditional Decrement)
As implemented in [`server/controllers/borrowController.js`](file:///d:/projects/sem-4-fsd-project/server/controllers/borrowController.js):

```javascript
// 1. Avoid separate read-then-write checks (e.g. if copies > 0 then save) because concurrent requests can interleave.
// 2. Instead, use an atomic conditional update: Book.findOneAndUpdate({ _id: id, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } }).
// 3. MongoDB executes document-level updates atomically under internal write locks, serializing simultaneous attempts.
// 4. If two librarians issue the last copy simultaneously, only the first request matches the query; the second receives null.
// 5. This guarantees availableCopies never drops below 0 and eliminates race conditions without distributed locks.
```

If the atomic operation returns `null`, the second request is immediately informed that no copies are available (HTTP 400), preventing overselling. Furthermore, if creating the `BorrowRecord` fails after decrementing, a compensating rollback automatically increments `availableCopies` back by 1.

---

## 📬 Postman Collection

A complete Postman collection is included in:
- `server/ShelfLife.postman_collection.json`
- `ShelfLife.postman_collection.json`

### Features:
1. **Automated Token Management**: The login request automatically extracts `response.token` and stores it into the collection variable `authToken`.
2. **Dynamic Chaining**: Creating a book or member automatically sets `bookId` and `memberId` collection variables, and borrowing automatically sets `borrowId`.
3. **Pre-configured Authorization**: All protected endpoints inherit Bearer Token authentication seamlessly.
