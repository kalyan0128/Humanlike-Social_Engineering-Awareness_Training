import { 
  users, type User, type InsertUser,
  trainingModules, type TrainingModule, type InsertTrainingModule,
  userProgress, type UserProgress, type InsertUserProgress,
  threatScenarios, type ThreatScenario, type InsertThreatScenario,
  organizationPolicies, type OrganizationPolicy, type InsertOrganizationPolicy,
  chatMessages, type ChatMessage, type InsertChatMessage,
  achievements, type Achievement, type InsertAchievement,
  userAchievements, type UserAchievement, type InsertUserAchievement
} from "@shared/schema";
import bcrypt from "bcryptjs";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Training module operations
  getTrainingModules(): Promise<TrainingModule[]>;
  getTrainingModule(id: number): Promise<TrainingModule | undefined>;
  getNextRecommendedModules(userId: number, limit?: number): Promise<TrainingModule[]>;
  
  // User progress operations
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getCompletedModulesCount(userId: number): Promise<number>;
  
  // Threat scenario operations
  getThreatScenarios(limit?: number): Promise<ThreatScenario[]>;
  getThreatScenario(id: number): Promise<ThreatScenario | undefined>;
  
  // Organization policy operations
  getOrganizationPolicies(limit?: number): Promise<OrganizationPolicy[]>;
  getOrganizationPolicy(id: number): Promise<OrganizationPolicy | undefined>;
  
  // Chat message operations
  getChatMessages(userId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  
  // User achievement operations
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trainingModules: Map<number, TrainingModule>;
  private userProgress: Map<number, UserProgress>;
  private threatScenarios: Map<number, ThreatScenario>;
  private organizationPolicies: Map<number, OrganizationPolicy>;
  private chatMessages: Map<number, ChatMessage>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  
  private currentUserId: number;
  private currentTrainingModuleId: number;
  private currentUserProgressId: number;
  private currentThreatScenarioId: number;
  private currentOrganizationPolicyId: number;
  private currentChatMessageId: number;
  private currentAchievementId: number;
  private currentUserAchievementId: number;

  constructor() {
    this.users = new Map();
    this.trainingModules = new Map();
    this.userProgress = new Map();
    this.threatScenarios = new Map();
    this.organizationPolicies = new Map();
    this.chatMessages = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    
    this.currentUserId = 1;
    this.currentTrainingModuleId = 1;
    this.currentUserProgressId = 1;
    this.currentThreatScenarioId = 1;
    this.currentOrganizationPolicyId = 1;
    this.currentChatMessageId = 1;
    this.currentAchievementId = 1;
    this.currentUserAchievementId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // Initialize sample data for development
  private async initSampleData() {
    // Add training modules
    const moduleData: InsertTrainingModule[] = [
      {
        title: "Social Engineering Basics",
        description: "Learn the foundations of social engineering attacks",
        content: "Content for social engineering basics...",
        type: "quiz",
        difficulty: "beginner",
        xpReward: 10,
        order: 1
      },
      {
        title: "Phishing Detection",
        description: "Learn to identify phishing attempts",
        content: "Content for phishing detection...",
        type: "scenario",
        difficulty: "beginner",
        xpReward: 15,
        order: 2
      },
      {
        title: "Social Engineering Red Flags",
        description: "Learn to identify warning signs",
        content: "Content for social engineering red flags...",
        type: "video",
        difficulty: "intermediate",
        xpReward: 20,
        order: 3
      },
      {
        title: "Password Security Best Practices",
        description: "Create strong, unique passwords",
        content: "Content for password security...",
        type: "quiz",
        difficulty: "intermediate",
        xpReward: 20,
        order: 4
      }
    ];
    
    for (const module of moduleData) {
      await this.addTrainingModule(module);
    }
    
    // Add threat scenarios
    const threatData: InsertThreatScenario[] = [
      {
        title: "Vendor Impersonation Attack",
        description: "Attackers impersonate trusted vendors requesting urgent system access or invoice payments.",
        content: "Full content for vendor impersonation attack...",
        difficulty: "intermediate",
        isNew: true,
        isTrending: false
      },
      {
        title: "Executive Whaling Attack",
        description: "Sophisticated phishing attacks targeting C-level executives for financial gain or data theft.",
        content: "Full content for executive whaling attack...",
        difficulty: "advanced",
        isNew: false,
        isTrending: true
      }
    ];
    
    for (const threat of threatData) {
      await this.addThreatScenario(threat);
    }
    
    // Add organization policies
    const policyData: InsertOrganizationPolicy[] = [
      {
        title: "Data Classification Policy",
        description: "Guidelines for classifying and handling sensitive information",
        content: "Full content for data classification policy...",
        category: "data-security"
      },
      {
        title: "Email Security Guidelines",
        description: "Procedures for secure email communication",
        content: "Full content for email security guidelines...",
        category: "communication"
      },
      {
        title: "Incident Reporting Protocol",
        description: "Steps to report security incidents",
        content: "Full content for incident reporting protocol...",
        category: "incident-response"
      }
    ];
    
    for (const policy of policyData) {
      await this.addOrganizationPolicy(policy);
    }
    
    // Add achievements
    const achievementData: InsertAchievement[] = [
      {
        title: "Phishing Expert",
        description: "Completed all phishing-related modules",
        icon: "fishing",
        requiredXp: 50
      },
      {
        title: "Perfect Quiz Score",
        description: "Achieved 100% on a quiz",
        icon: "quiz",
        requiredXp: 30
      },
      {
        title: "Fast Learner",
        description: "Completed 5 modules in a week",
        icon: "speed",
        requiredXp: 75
      }
    ];
    
    for (const achievement of achievementData) {
      await this.addAchievement(achievement);
    }
  }

  // Helper methods for sample data
  private async addTrainingModule(module: InsertTrainingModule): Promise<TrainingModule> {
    const id = this.currentTrainingModuleId++;
    const trainingModule: TrainingModule = {
      ...module,
      id,
      createdAt: new Date()
    };
    this.trainingModules.set(id, trainingModule);
    return trainingModule;
  }
  
  private async addThreatScenario(scenario: InsertThreatScenario): Promise<ThreatScenario> {
    const id = this.currentThreatScenarioId++;
    const threatScenario: ThreatScenario = {
      ...scenario,
      id,
      createdAt: new Date()
    };
    this.threatScenarios.set(id, threatScenario);
    return threatScenario;
  }
  
  private async addOrganizationPolicy(policy: InsertOrganizationPolicy): Promise<OrganizationPolicy> {
    const id = this.currentOrganizationPolicyId++;
    const organizationPolicy: OrganizationPolicy = {
      ...policy,
      id,
      createdAt: new Date()
    };
    this.organizationPolicies.set(id, organizationPolicy);
    return organizationPolicy;
  }
  
  private async addAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentAchievementId++;
    const newAchievement: Achievement = {
      ...achievement,
      id
    };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      level: "BEGINNER",
      xpPoints: 0,
      completedModules: 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Training module operations
  async getTrainingModules(): Promise<TrainingModule[]> {
    return Array.from(this.trainingModules.values()).sort((a, b) => a.order - b.order);
  }
  
  async getTrainingModule(id: number): Promise<TrainingModule | undefined> {
    return this.trainingModules.get(id);
  }
  
  async getNextRecommendedModules(userId: number, limit: number = 2): Promise<TrainingModule[]> {
    // Get completed module IDs for this user
    const completedModuleIds = Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId && progress.completed)
      .map(progress => progress.moduleId);
    
    // Find modules that haven't been completed yet
    const recommendedModules = Array.from(this.trainingModules.values())
      .filter(module => !completedModuleIds.includes(module.id))
      .sort((a, b) => a.order - b.order)
      .slice(0, limit);
    
    return recommendedModules;
  }

  // User progress operations
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      progress => progress.userId === userId
    );
  }
  
  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentUserProgressId++;
    const now = new Date();
    const userProgress: UserProgress = {
      ...progress,
      id,
      completedAt: progress.completed ? now : null
    };
    this.userProgress.set(id, userProgress);
    
    // Update user's completed modules count if this is a new completion
    if (progress.completed) {
      const user = await this.getUser(progress.userId);
      if (user) {
        user.completedModules += 1;
        const module = await this.getTrainingModule(progress.moduleId);
        if (module) {
          user.xpPoints += module.xpReward;
          
          // Update user level based on XP
          if (user.xpPoints >= 500) {
            user.level = "ADVANCED";
          } else if (user.xpPoints >= 200) {
            user.level = "INTERMEDIATE";
          }
        }
        this.users.set(user.id, user);
      }
    }
    
    return userProgress;
  }
  
  async getCompletedModulesCount(userId: number): Promise<number> {
    const user = await this.getUser(userId);
    return user ? user.completedModules : 0;
  }

  // Threat scenario operations
  async getThreatScenarios(limit?: number): Promise<ThreatScenario[]> {
    const scenarios = Array.from(this.threatScenarios.values())
      .sort((a, b) => {
        // Sort by new first, then trending, then by created date
        if (a.isNew !== b.isNew) {
          return a.isNew ? -1 : 1;
        }
        if (a.isTrending !== b.isTrending) {
          return a.isTrending ? -1 : 1;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    
    return limit ? scenarios.slice(0, limit) : scenarios;
  }
  
  async getThreatScenario(id: number): Promise<ThreatScenario | undefined> {
    return this.threatScenarios.get(id);
  }

  // Organization policy operations
  async getOrganizationPolicies(limit?: number): Promise<OrganizationPolicy[]> {
    const policies = Array.from(this.organizationPolicies.values())
      .sort((a, b) => a.title.localeCompare(b.title));
    
    return limit ? policies.slice(0, limit) : policies;
  }
  
  async getOrganizationPolicy(id: number): Promise<OrganizationPolicy | undefined> {
    return this.organizationPolicies.get(id);
  }

  // Chat message operations
  async getChatMessages(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return limit ? messages.slice(-limit) : messages;
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatMessageId++;
    const chatMessage: ChatMessage = {
      ...message,
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }
  
  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  // User achievement operations
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values())
      .filter(achievement => achievement.userId === userId);
  }
  
  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.currentUserAchievementId++;
    const newUserAchievement: UserAchievement = {
      ...userAchievement,
      id,
      earnedAt: new Date()
    };
    this.userAchievements.set(id, newUserAchievement);
    return newUserAchievement;
  }
}

export const storage = new MemStorage();
