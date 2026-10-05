export interface Book {
  _id: string;
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  totalCopies: number;
  availableCopies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  _id: string;
  name: string;
  email: string;
  membershipId: string;
  joinedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BorrowRecord {
  _id: string;
  book: Book | string;
  member: Member | string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'issued' | 'returned' | 'overdue';
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  errors?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}

export interface BooksQuery {
  genre?: string;
  page?: number;
  limit?: number;
}

export interface BooksResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Book[];
}

export interface MembersResponse {
  success: boolean;
  count: number;
  data: Member[];
}

export interface BorrowRequest {
  bookId: string;
  memberId: string;
  dueDate: string;
}

export interface BorrowResponse {
  success: boolean;
  message: string;
  data: BorrowRecord;
  bookAvailableCopies: number;
}

export interface ReturnResponse {
  success: boolean;
  message: string;
  data: BorrowRecord;
  bookAvailableCopies: number | null;
}

export interface MemberHistoryResponse {
  success: boolean;
  member: Member;
  count: number;
  data: BorrowRecord[];
}
