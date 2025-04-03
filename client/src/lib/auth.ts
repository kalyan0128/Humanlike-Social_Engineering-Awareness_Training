import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

interface LoginResponse {
  user: User;
  token: string;
}

interface SignupData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Function to login user
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  const data: LoginResponse = await response.json();
  
  // Store token in localStorage for persistence
  localStorage.setItem("token", data.token);
  
  return data;
};

// Function to signup user
export const signupUser = async (signupData: SignupData): Promise<LoginResponse> => {
  const response = await apiRequest("POST", "/api/auth/signup", signupData);
  const data: LoginResponse = await response.json();
  
  // Store token in localStorage for persistence
  localStorage.setItem("token", data.token);
  
  return data;
};

// Function to logout user
export const logoutUser = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("acknowledged");
};

// Function to get current user data
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiRequest("GET", "/api/user");
  return response.json();
};

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

// Function to check if user has acknowledged the platform
export const isAcknowledged = (): boolean => {
  return localStorage.getItem("acknowledged") === "true";
};

// Function to set user acknowledged status
export const setAcknowledgedStatus = (status: boolean): void => {
  localStorage.setItem("acknowledged", status.toString());
};

// Function to get auth token
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};
