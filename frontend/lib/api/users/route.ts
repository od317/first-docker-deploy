import { apiClient } from "../client";
import type {
  User,
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
} from "./types";

export const userApi = {
  // Get current user
  getCurrentUser: (): Promise<User> => {
    return apiClient.get<User>("/users/me");
  },

  // Create new user
  createUser: (userData: CreateUserRequest): Promise<User> => {
    return apiClient.post<User>("/users", userData);
  },

  // Login
  login: (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/auth/login", credentials);
  },
};
