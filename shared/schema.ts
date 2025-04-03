import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  level: text("level").default("BEGINNER").notNull(),
  xpPoints: integer("xp_points").default(0).notNull(),
  completedModules: integer("completed_modules").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Training module schema
export const trainingModules = pgTable("training_modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // e.g., "video", "quiz", "scenario"
  difficulty: text("difficulty").notNull(), // e.g., "beginner", "intermediate", "advanced"
  xpReward: integer("xp_reward").default(10).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User progress schema
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  moduleId: integer("module_id").notNull().references(() => trainingModules.id),
  completed: boolean("completed").default(false).notNull(),
  score: integer("score"),
  completedAt: timestamp("completed_at"),
});

// Threat scenarios schema
export const threatScenarios = pgTable("threat_scenarios", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  difficulty: text("difficulty").notNull(),
  isNew: boolean("is_new").default(true).notNull(),
  isTrending: boolean("is_trending").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Organization policies schema
export const organizationPolicies = pgTable("organization_policies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat messages schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isBot: boolean("is_bot").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Achievements schema
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requiredXp: integer("required_xp").notNull(),
});

// User achievements schema
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const insertTrainingModuleSchema = createInsertSchema(trainingModules).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  completedAt: true,
});

export const insertThreatScenarioSchema = createInsertSchema(threatScenarios).omit({
  id: true,
  createdAt: true,
});

export const insertOrganizationPolicySchema = createInsertSchema(organizationPolicies).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Chat message schema for the LLM API
export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;

export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type ThreatScenario = typeof threatScenarios.$inferSelect;
export type InsertThreatScenario = z.infer<typeof insertThreatScenarioSchema>;

export type OrganizationPolicy = typeof organizationPolicies.$inferSelect;
export type InsertOrganizationPolicy = z.infer<typeof insertOrganizationPolicySchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type ChatMessageRequest = z.infer<typeof chatMessageSchema>;
