// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Dashboard types
export interface RecommendedModule {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty: string;
}

export interface ThreatScenario {
  id: number;
  title: string;
  description: string;
  content: string;
  difficulty: string;
  isNew: boolean;
  isTrending: boolean;
  createdAt: string;
}

export interface OrganizationPolicy {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  createdAt: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  requiredXp: number;
}

export interface UserProgress {
  id: number;
  userId: number;
  moduleId: number;
  completed: boolean;
  score: number | null;
  completedAt: string | null;
}

export interface ChatMessage {
  id: number;
  userId: number;
  content: string;
  isBot: boolean;
  timestamp: string;
}
