import axios from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  last_login: string | null;
  status: "active" | "blocked" | "deleted";
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ApiSuccessResponse {
  message: string;
}

export interface ResetPasswordRequestData {
  email: string;
}

export const registerUser = async (
  credentials: RegisterCredentials
): Promise<AxiosResponse<{ message: string; userId: number }>> => {
  return apiClient.post("/auth/register", credentials);
};

export const loginUser = async (
  credentials: LoginCredentials
): Promise<
  AxiosResponse<{
    message: string;
    token: string;
    user: Omit<User, "last_login" | "status" | "created_at">;
  }>
> => {
  return apiClient.post("/auth/login", credentials);
};

export const fetchUsers = async (): Promise<AxiosResponse<User[]>> => {
  return apiClient.get("/users");
};

export const blockUsers = async (
  userIds: number[]
): Promise<AxiosResponse<ApiSuccessResponse>> => {
  return apiClient.post("/users/block", { userIds });
};

export const unblockUsers = async (
  userIds: number[]
): Promise<AxiosResponse<ApiSuccessResponse>> => {
  return apiClient.post("/users/unblock", { userIds });
};

export const deleteUsers = async (
  userIds: number[]
): Promise<AxiosResponse<ApiSuccessResponse>> => {
  return apiClient.delete("/users", { data: { userIds } });
};

export const resetPasswordRequest = async (
  data: ResetPasswordRequestData
): Promise<AxiosResponse<{ message: string }>> => {
  return apiClient.post("/auth/reset-password-request", data);
};

export default apiClient;
