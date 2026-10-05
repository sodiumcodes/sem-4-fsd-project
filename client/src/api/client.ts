import type {
  ApiResponse,
  Book,
  BooksQuery,
  BooksResponse,
  BorrowRequest,
  BorrowResponse,
  LoginRequest,
  LoginResponse,
  Member,
  MemberHistoryResponse,
  MembersResponse,
  ReturnResponse,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem('shelflife_auth_token'),
  set: (token: string): void => localStorage.setItem('shelflife_auth_token', token),
  clear: (): void => localStorage.removeItem('shelflife_auth_token'),
};

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = false, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = tokenStorage.get();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: requestHeaders,
    ...rest,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.message ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : 'An unexpected error occurred');
    throw new Error(errorMessage);
  }

  return data as T;
}

// Typed API modules
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.token) {
      tokenStorage.set(res.token);
    }
    return res;
  },
  logout: (): void => {
    tokenStorage.clear();
  },
  isAuthenticated: (): boolean => {
    return !!tokenStorage.get();
  },
};

export const booksApi = {
  getAll: async (query?: BooksQuery): Promise<BooksResponse> => {
    const params = new URLSearchParams();
    if (query?.genre) params.append('genre', query.genre);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<BooksResponse>(`/api/books${queryString}`, {
      requiresAuth: true,
    });
  },

  create: async (book: Omit<Book, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Book>> => {
    return request<ApiResponse<Book>>('/api/books', {
      method: 'POST',
      body: JSON.stringify(book),
      requiresAuth: true,
    });
  },
};

export const membersApi = {
  getAll: async (): Promise<MembersResponse> => {
    return request<MembersResponse>('/api/members', {
      requiresAuth: true,
    });
  },

  create: async (
    member: Omit<Member, '_id' | 'createdAt' | 'updatedAt' | 'joinedDate'>
  ): Promise<ApiResponse<Member>> => {
    return request<ApiResponse<Member>>('/api/members', {
      method: 'POST',
      body: JSON.stringify(member),
      requiresAuth: true,
    });
  },

  getHistory: async (memberId: string): Promise<MemberHistoryResponse> => {
    return request<MemberHistoryResponse>(`/api/members/${memberId}/history`, {
      requiresAuth: true,
    });
  },
};

export const borrowApi = {
  issue: async (payload: BorrowRequest): Promise<BorrowResponse> => {
    return request<BorrowResponse>('/api/borrow', {
      method: 'POST',
      body: JSON.stringify(payload),
      requiresAuth: true,
    });
  },

  returnBook: async (borrowId: string): Promise<ReturnResponse> => {
    return request<ReturnResponse>(`/api/return/${borrowId}`, {
      method: 'POST',
      requiresAuth: true,
    });
  },
};
