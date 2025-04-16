import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
// import { storage } from "./storage";
// Using PostgreSQL database instead of in-memory storage
import { storage } from "./storage-pg";

// Fix TypeScript type issues
type AnyParam = any; // We need this for type safety in some event handlers
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
    "what is pretexting": "Pretexting is a type of social engineering where an attacker creates a fabricated scenario (pretext) to engage a victim and gain their trust. The attacker usually impersonates someone in authority or a trusted entity to extract information or influence behavior. For example, they might pose as a bank representative, IT support, or coworker.",
    "what is baiting": "Baiting is a social engineering attack that uses a false promise to pique a victim's curiosity or greed, enticing them to take the bait. This could be in the form of free music or movie downloads, or even physical items like USB drives left in public places that contain malware.",
    "what is quid pro quo": "Quid pro quo attacks involve an attacker requesting information or access in exchange for something. For example, an attacker might pose as IT support and call random employees offering assistance, in exchange for the employee providing their login credentials or disabling security measures.",
    "what is tailgating": "Tailgating (also called piggybacking) is a physical social engineering attack where an unauthorized person follows an authorized person into a restricted area. The attacker might pretend to have forgotten their access card and ask someone to hold the door, exploiting human courtesy.",
    "what is spear phishing": "Spear phishing is a targeted form of phishing where attackers customize their approach for specific individuals or organizations. They research their targets and craft highly personalized messages, often impersonating trusted contacts, making these attacks more convincing and harder to detect than general phishing attempts.",
    "what is whaling": "Whaling is a type of spear phishing that specifically targets high-profile executives or other high-value targets within an organization. These attacks aim to steal sensitive information or initiate fraudulent financial transactions. They're called 'whaling' because they go after the 'big fish' in an organization.",
    "what is vishing": "Vishing (voice phishing) is a social engineering attack using phone calls to trick victims into revealing personal information, financial details, or credentials. Attackers often spoof caller ID to appear legitimate and create scenarios requiring urgent action to bypass the victim's normal caution.",
    "what is smishing": "Smishing (SMS phishing) is a social engineering attack that uses text messages to trick recipients into taking actions that compromise their security. These messages often contain links to malicious websites or prompt users to call fraudulent numbers where they're asked to provide sensitive information.",
    "what are the signs of a phishing email": "Signs of a phishing email include: 1) Generic greetings instead of your name, 2) Poor grammar or spelling errors, 3) Urgent requests for action, 4) Suspicious or mismatched sender addresses, 5) Links that don't match the legitimate website when you hover over them, 6) Unexpected attachments, 7) Requests for personal information, and 8) Offers that seem too good to be true.",
    "what is social engineering awareness training": "Social engineering awareness training educates employees about different social engineering tactics and how to recognize and respond to them. It typically includes simulated attacks, case studies, best practices, and reporting procedures. Regular training helps organizations build a human firewall against these psychological manipulation attempts.",
    "what to do if i suspect a social engineering attack": "If you suspect a social engineering attack: 1) Don't provide any information or take requested actions, 2) Stay calm and don't feel pressured, 3) Verify the request through official channels (not using contact details provided in the suspicious message), 4) Report the incident to your IT security team immediately, 5) Document the interaction, and 6) If you've already responded, change any compromised credentials immediately.",
    "what is a security policy": "A security policy is a document that outlines an organization's rules, guidelines and practices for maintaining security. It typically includes acceptable use policies, password requirements, data handling procedures, incident response protocols, and social engineering awareness guidelines. These policies help protect organizational assets and provide a framework for security decision-making.",
    "what is multi-factor authentication": "Multi-factor authentication (MFA) is a security method that requires users to provide two or more verification factors to gain access to a resource. These factors typically include something you know (password), something you have (security token or mobile device), and something you are (biometric verification). MFA significantly reduces the risk of unauthorized access even if credentials are compromised through social engineering.",
    "help": "I can provide information about various social engineering topics. Try asking about specific types of attacks (phishing, pretexting, baiting, etc.), prevention methods, how to identify attacks, or what to do if you suspect you're being targeted. I'm here to help increase your awareness of social engineering threats!",
    "hello": "Hello! I'm HumanLike-AwareBot, your social engineering awareness assistant. I can help you learn about various social engineering tactics, prevention methods, and security best practices. What would you like to know about today?",
    "hi": "Hi there! I'm HumanLike-AwareBot, your guide to understanding and defending against social engineering attacks. Feel free to ask me about specific attack types, warning signs, or protection strategies. How can I assist you today?"
  };

  // Look for keywords in the message to provide relevant response
  const normalizedMsg = message.toLowerCase();
  for (const [keyword, response] of Object.entries(socialEngineeringResponses)) {
    if (normalizedMsg.includes(keyword)) {
      return response;
    }
  }

  // Default response if no keywords are matched
  return "I'm here to help with questions about social engineering. You can ask about phishing, pretexting, prevention methods, or other related topics to increase your awareness of these security threats. If you need suggestions, try asking 'What is social engineering?' or 'How can I prevent social engineering attacks?'";
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
  
  // Guest login endpoint
  app.post("/api/auth/guest", async (req, res) => {
    try {
      // Check if a guest user already exists
      let guestUser = await storage.getUserByEmail("guest@example.com");
      
      // Create guest user if doesn't exist
      if (!guestUser) {
        guestUser = await storage.createUser({
          username: "guest",
          firstName: "Guest",
          lastName: "User",
          email: "guest@example.com",
          password: await bcrypt.hash("guest123", 10),
          level: "BEGINNER",
          xpPoints: 10
        });
      }
      
      // Create JWT token
      const token = jwt.sign({ userId: guestUser.id }, JWT_SECRET, { expiresIn: "1d" });
      
      // Return user data (excluding password) and token
      const { password: _, ...userWithoutPassword } = guestUser;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "Guest login failed" });
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
