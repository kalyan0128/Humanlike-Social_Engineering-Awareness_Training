import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { 
  loginUser, 
  signupUser, 
  logoutUser, 
  getCurrentUser, 
  isAuthenticated as checkIsAuthenticated,
  isAcknowledged as checkIsAcknowledged,
  setAcknowledgedStatus
} from "@/lib/auth";

// Create the Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

interface SignupData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAcknowledged: boolean;
  setAcknowledged: (status: boolean) => void;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated
        const authenticated = checkIsAuthenticated();
        setIsAuthenticated(authenticated);
        
        // Check if user has acknowledged
        const acknowledged = checkIsAcknowledged();
        setIsAcknowledged(acknowledged);
        
        // Get user data if authenticated
        if (authenticated) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        
        // Handle token expiration
        if (error instanceof Error && error.message.includes("401")) {
          logout();
          // We removed the toast here as it was causing circular dependencies
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await loginUser(email, password);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const { user, token } = await signupUser(data);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setIsAuthenticated(false);
    setIsAcknowledged(false);
  };
  
  const setAcknowledged = (status: boolean) => {
    setAcknowledgedStatus(status);
    setIsAcknowledged(status);
  };

  const authContextValue: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isAuthenticated,
    isLoading,
    isAcknowledged,
    setAcknowledged
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
