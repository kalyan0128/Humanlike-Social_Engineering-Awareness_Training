import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { 
  insertUserSchema, 
  loginSchema, 
  insertUserProgressSchema,
  chatMessageSchema 
} from "@shared/schema";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// JWT secret key (ideally from environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "humanlike-awarebot-secret-key";

// Middleware to verify JWT token
const authenticate = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Mock DeepSeek LLM API response
const mockLLMResponse = async (message: string): Promise<string> => {
  // In a real implementation, this would call the DeepSeek R1 LLM API
  const socialEngineeringResponses: Record<string, string> = {
    "what is social engineering": "Social engineering is the psychological manipulation of people into performing actions or divulging confidential information. It's a type of security attack that relies on human interaction rather than technical hacking techniques. Common types include phishing, pretexting, baiting, quid pro quo, and tailgating.",
    "what is phishing": "Phishing is a type of social engineering attack where attackers attempt to steal sensitive information by disguising themselves as trustworthy entities in electronic communications. Typically, victims receive an email or message that appears to be from a legitimate organization, prompting them to provide sensitive data.",
    "how can i prevent social engineering attacks": "To prevent social engineering attacks: 1) Verify identities using trusted channels, 2) Be skeptical of urgent requests, 3) Don't share sensitive information unless absolutely necessary, 4) Use multi-factor authentication, 5) Keep software updated, 6) Report suspicious communications, 7) Attend regular security awareness training.",
    "what are common signs of phishing": "Common signs of phishing include: 1) Urgency or threatening language, 2) Grammatical errors or poor spelling, 3) Mismatched or suspicious URLs, 4) Requests for sensitive information, 5) Generic greetings instead of personalized ones, 6) Suspicious attachments, 7) Offers that seem too good to be true.",
    "what is pretexting": "Pretexting is a type of social engineering where an attacker creates a fabricated scenario (pretext) to engage a victim and gain their trust. The attacker usually impersonates someone in authority or a trusted entity to extract information or influence behavior. For example, they might pose as a bank representative, IT support, or coworker."
  };

  // Look for keywords in the message to provide relevant response
  const normalizedMsg = message.toLowerCase();
  for (const [keyword, response] of Object.entries(socialEngineeringResponses)) {
    if (normalizedMsg.includes(keyword)) {
      return response;
    }
  }

  // Default response if no keywords are matched
  return "I'm here to help with questions about social engineering. You can ask about phishing, pretexting, prevention methods, or other related topics to increase your awareness of these security threats.";
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const user = await storage.createUser(userData);
      
      // Create JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Return user data (excluding password) and token
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Create JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      
      // Return user data (excluding password) and token
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // User data endpoint (requires authentication)
  app.get("/api/user", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user data" });
    }
  });
  
  // Dashboard data endpoint
  app.get("/api/dashboard", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user progress stats
      const progress = await storage.getUserProgress(userId);
      const completedModules = progress.filter(p => p.completed).length;
      const totalModules = (await storage.getTrainingModules()).length;
      const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
      
      // Get next recommended modules
      const recommendedModules = await storage.getNextRecommendedModules(userId, 2);
      
      // Get latest threat scenarios
      const latestThreats = await storage.getThreatScenarios(2);
      
      // Get organization policies
      const policies = await storage.getOrganizationPolicies(3);
      
      // Get user achievements
      const userAchievementIds = (await storage.getUserAchievements(userId)).map(ua => ua.achievementId);
      const allAchievements = await storage.getAchievements();
      const achievements = allAchievements.filter(a => userAchievementIds.includes(a.id));
      
      // Calculate XP to next level
      let nextLevelXp = 1000;
      if (user.level === "BEGINNER") {
        nextLevelXp = 200;
      } else if (user.level === "INTERMEDIATE") {
        nextLevelXp = 500;
      }
      const xpToNextLevel = nextLevelXp - user.xpPoints;
      const xpProgress = Math.round(((nextLevelXp - xpToNextLevel) / nextLevelXp) * 100);
      
      // Return dashboard data
      res.json({
        userProgress: {
          completedModules,
          totalModules,
          progressPercentage,
          currentLevel: user.level,
          xpPoints: user.xpPoints,
          xpToNextLevel,
          xpProgress
        },
        recommendedModules,
        latestThreats,
        policies,
        achievements
      });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving dashboard data" });
    }
  });
  
  // Training modules endpoints
  app.get("/api/training-modules", authenticate, async (req, res) => {
    try {
      const modules = await storage.getTrainingModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving training modules" });
    }
  });
  
  app.get("/api/training-modules/:id", authenticate, async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      const module = await storage.getTrainingModule(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: "Training module not found" });
      }
      
      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving training module" });
    }
  });
  
  // User progress endpoint
  app.post("/api/user-progress", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId
      });
      
      const progress = await storage.updateUserProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error updating progress" });
    }
  });
  
  // Threat scenarios endpoints
  app.get("/api/threat-scenarios", authenticate, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const scenarios = await storage.getThreatScenarios(limit);
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving threat scenarios" });
    }
  });
  
  app.get("/api/threat-scenarios/:id", authenticate, async (req, res) => {
    try {
      const scenarioId = parseInt(req.params.id);
      const scenario = await storage.getThreatScenario(scenarioId);
      
      if (!scenario) {
        return res.status(404).json({ message: "Threat scenario not found" });
      }
      
      res.json(scenario);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving threat scenario" });
    }
  });
  
  // Organization policies endpoints
  app.get("/api/organization-policies", authenticate, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const policies = await storage.getOrganizationPolicies(limit);
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving organization policies" });
    }
  });
  
  app.get("/api/organization-policies/:id", authenticate, async (req, res) => {
    try {
      const policyId = parseInt(req.params.id);
      const policy = await storage.getOrganizationPolicy(policyId);
      
      if (!policy) {
        return res.status(404).json({ message: "Organization policy not found" });
      }
      
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving organization policy" });
    }
  });
  
  // Chat message endpoints
  app.get("/api/chat-messages", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const messages = await storage.getChatMessages(userId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving chat messages" });
    }
  });
  
  app.post("/api/chat", authenticate, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { message } = chatMessageSchema.parse(req.body);
      
      // Store user message
      await storage.createChatMessage({
        userId,
        content: message,
        isBot: false
      });
      
      // Generate bot response using DeepSeek R1 LLM (mocked for now)
      const botResponse = await mockLLMResponse(message);
      
      // Store bot response
      const storedBotResponse = await storage.createChatMessage({
        userId,
        content: botResponse,
        isBot: true
      });
      
      res.json(storedBotResponse);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      res.status(500).json({ message: "Error processing chat message" });
    }
  });

  return httpServer;
}
