// User and authentication types

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  grade?: number;
  faculty?: "SFC" | "PM" | "ENV";
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  interests?: string[];
  graduationYear?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
