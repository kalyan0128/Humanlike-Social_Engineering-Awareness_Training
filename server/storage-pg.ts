// For PostgreSQL database
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import {
  users, trainingModules, userProgress, threatScenarios,
  organizationPolicies, chatMessages, achievements, userAchievements,
  type User, type InsertUser, type TrainingModule, type InsertTrainingModule,
  type UserProgress, type InsertUserProgress, type ThreatScenario, type InsertThreatScenario,
  type OrganizationPolicy, type InsertOrganizationPolicy, type ChatMessage,
  type InsertChatMessage, type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement
} from "@shared/schema";
import { eq, and, desc, sql, not, asc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";

import { db } from "./db";

const PostgresSessionStore = connectPg(session);

// IStorage interface definition 
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
  
  // Session store for Express
  sessionStore: session.Store;
}

// PostgreSQL storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      createTableIfMissing: true,
      conObject: {
        connectionString: process.env.DATABASE_URL,
      }
    });
    
    // Initialize sample data if needed
    this.initSampleData();
  }
  
  private async initSampleData() {
    // Check if we have any users
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Sample data already exists");
      return;
    }
    
    console.log("Initializing sample data...");
    
    try {
      // Sample training modules
      await this.addTrainingModule({
        title: "Introduction to Social Engineering",
        description: "Learn the basics of social engineering threats and how to identify them.",
        type: "article",
        difficulty: "beginner",
        content: "# Introduction to Social Engineering\n\nSocial engineering is the art of manipulating people into performing actions or divulging confidential information. This is a type of confidence trick for the purpose of information gathering, fraud, or system access.\n\n## Common Types of Social Engineering Attacks\n\n### Phishing\nPhishing attacks use email or malicious websites to solicit personal information by posing as a trustworthy organization. For example, an attacker might send an email seemingly from your bank, asking you to verify your account details.\n\n### Pretexting\nPretexting involves creating a fabricated scenario to engage a victim and obtain information. For example, an attacker might impersonate a co-worker, police, bank, or tax official to gain access to personal information.\n\n### Baiting\nBaiting attacks use a false promise to pique a victim's greed or curiosity. They might offer users free music or movie downloads, if they surrender their login credentials.\n\n### Quid Pro Quo\nQuid pro quo attacks promise a benefit in exchange for information. This could include a hacker impersonating an IT services company and calling people randomly, offering IT assistance in exchange for login credentials.\n\n### Tailgating\nTailgating is when an unauthorized person follows an authorized person into a restricted area. This attack works by taking advantage of people's politeness in holding doors open for others.\n\n## How to Protect Yourself\n\n1. **Verify the source** - Always verify the identity of anyone requesting sensitive information.\n2. **Be skeptical** - If something seems suspicious or too good to be true, it probably is.\n3. **Use multi-factor authentication** - This adds an extra layer of security beyond just a password.\n4. **Keep software updated** - Ensure your software and systems are up-to-date with the latest security patches.\n5. **Educate yourself and others** - Regular training and awareness can help recognize and prevent social engineering attacks.\n\nRemember, social engineering attacks exploit human psychology and behavior, not technological vulnerabilities. Staying informed and vigilant is the best defense against these types of threats.",
        xpReward: 10,
        order: 1
      });
      
      await this.addTrainingModule({
        title: "Phishing Attack Recognition",
        description: "Master the skills to identify and avoid various types of phishing attacks.",
        type: "quiz",
        difficulty: "beginner",
        content: JSON.stringify({
          introduction: "Phishing attacks attempt to steal your personal information by disguising as trustworthy entities. This quiz will test your knowledge on recognizing various phishing techniques.",
          questions: [
            {
              id: 1,
              question: "Which of the following is NOT a common indicator of a phishing email?",
              options: [
                "Urgent language demanding immediate action",
                "Misspelled domain names in email addresses",
                "Personal greeting using your full name",
                "Generic salutations like 'Dear Customer'"
              ],
              correctAnswer: 2,
              explanation: "Personalized greetings using your correct full name are actually less likely to be phishing attempts. Legitimate organizations that have your information will often address you personally. Generic greetings are more common in phishing attacks."
            },
            {
              id: 2,
              question: "What is 'spear phishing'?",
              options: [
                "A phishing attack targeting a specific individual or organization",
                "A phishing attack using telephone calls",
                "A phishing attack that only works on mobile devices",
                "A phishing attack that uses USB drives as the delivery method"
              ],
              correctAnswer: 0,
              explanation: "Spear phishing is a targeted attack directed at specific individuals or companies, rather than random targets. These attacks are customized using information about the target to increase their effectiveness."
            },
            {
              id: 3,
              question: "When receiving an email asking you to verify your account information, what is the safest course of action?",
              options: [
                "Click on the provided link and enter your information",
                "Reply directly to the email with your information",
                "Call the company using the phone number provided in the email",
                "Contact the company through their official website or a known phone number"
              ],
              correctAnswer: 3,
              explanation: "You should always verify requests independently by contacting the company through official channels like their official website or a known customer service number, not through information provided in the suspicious email."
            },
            {
              id: 4,
              question: "Which URL is most likely legitimate?",
              options: [
                "amazon-secure.com/login",
                "amazon.com-secure-login.net",
                "amazon.com/secure/login",
                "secure-amazon.net/login"
              ],
              correctAnswer: 2,
              explanation: "In this example, amazon.com/secure/login is likely legitimate because the domain (amazon.com) comes before the first slash. In the other examples, the domain is not actually amazon.com - it's amazon-secure.com, com-secure-login.net, or secure-amazon.net."
            },
            {
              id: 5,
              question: "What should you do if you think you've fallen for a phishing attack?",
              options: [
                "Ignore it and hope nothing happens",
                "Only monitor your accounts for suspicious activity",
                "Change the password for that account only",
                "Change your passwords, contact your financial institutions, and monitor your accounts"
              ],
              correctAnswer: 3,
              explanation: "If you believe you've fallen for a phishing attack, you should change your passwords (especially if you've used the same password elsewhere), contact your bank or credit card companies to alert them of potential fraud, and monitor your accounts for unauthorized activity."
            }
          ]
        }),
        xpReward: 20,
        order: 2
      });
      
      await this.addTrainingModule({
        title: "Password Security Best Practices",
        description: "Learn how to create and manage strong passwords to protect your accounts.",
        type: "article",
        difficulty: "beginner",
        content: "# Password Security Best Practices\n\nStrong, unique passwords are your first line of defense against unauthorized access to your accounts and personal information.\n\n## Why Password Security Matters\n\nWith the increasing number of data breaches, weak passwords can lead to:\n\n- Unauthorized access to your personal and financial information\n- Identity theft\n- Financial loss\n- Compromise of multiple accounts (if you reuse passwords)\n\n## Creating Strong Passwords\n\n### DO:\n\n1. **Use long passwords** - Aim for at least 12-16 characters.\n2. **Mix character types** - Include uppercase letters, lowercase letters, numbers, and special characters.\n3. **Use passphrases** - Consider using a memorable phrase or sentence as your password base.\n4. **Create unique passwords** - Use different passwords for different accounts.\n\n### DON'T:\n\n1. **Use personal information** - Avoid using names, birthdays, or other easily guessable information.\n2. **Use common substitutions** - Replacing 'a' with '@' or 'e' with '3' is predictable.\n3. **Reuse passwords** - Using the same password across multiple sites is risky.\n4. **Use dictionary words** - Simple words can be easily cracked.\n\n## Example of a Strong Password\n\nWeak: `password123`\nStrong: `Tr@vel*2NewZ3aland!2023`\n\nThe strong password uses a mix of character types and is based on a specific phrase that is meaningful to you but difficult for others to guess.\n\n## Password Management\n\n### Password Managers\n\nConsider using a password manager to securely store and generate strong, unique passwords for all your accounts. Popular options include:\n\n- LastPass\n- 1Password\n- Bitwarden\n- Dashlane\n\n### Multi-Factor Authentication (MFA)\n\nWhenever possible, enable MFA on your accounts. This adds an extra layer of security by requiring:\n\n1. Something you know (your password)\n2. Something you have (your phone or security key)\n3. Something you are (fingerprint or facial recognition)\n\n### Regular Password Updates\n\n- Change your passwords regularly, especially for critical accounts.\n- Update passwords immediately if you suspect a breach.\n- Monitor for security alerts related to services you use.\n\n## What to Do If Your Account Is Compromised\n\n1. Change your password immediately.\n2. Enable MFA if it wasn't already enabled.\n3. Check for unauthorized activity.\n4. Change the same password on any other sites where you used it.\n5. Report the breach to the service provider.\n\nRemember, your passwords are the keys to your digital life. Treating them with the appropriate level of security is essential in today's interconnected world.",
        xpReward: 15,
        order: 3
      });
      
      // Sample threat scenarios
      await this.addThreatScenario({
        title: "CEO Email Fraud Attempt",
        description: "Scenario depicting a business email compromise where an attacker impersonates the CEO.",
        content: "# CEO Email Fraud Attempt\n\n## Scenario Description\n\nYou are a financial officer at Acme Corporation. At 4:45 PM on Friday, you receive an urgent email that appears to be from your CEO, Alex Johnson:\n\n---\n\n**From:** Alex Johnson <alex.johnson.acmecorp@gmail.com>  \n**Subject:** Urgent wire transfer needed  \n**Date:** Friday, 4:45 PM\n\nHello,\n\nI'm currently in a confidential meeting with potential investors and need you to handle something discreetly. We need to secure our partnership with a new vendor immediately with a wire transfer of $47,500.\n\nDue to the sensitive nature of this deal, please keep this between us for now. I'll explain everything to the team on Monday. The vendor needs this payment today to hold our exclusive arrangement.\n\nPlease use these wire details:\n\nBank: First National Bank  \nAccount Name: Strategic Business Solutions  \nAccount Number: 7592136548  \nRouting Number: 211370545  \nReference: Project Phoenix\n\nConfirm when this is complete. I'm counting on you to handle this quickly and discreetly.\n\nThanks,  \nAlex Johnson  \nCEO, Acme Corporation  \nSent from my iPhone\n\n---\n\n## Red Flags in This Scenario\n\n1. **Sender email address**: The email comes from a Gmail account rather than the company domain (@acmecorp.com).\n\n2. **Urgency and timing**: The request comes late Friday, requiring action before the weekend, limiting verification options.\n\n3. **Request for secrecy**: The sender asks to keep the transaction confidential, preventing normal verification channels.\n\n4. **Unusual process**: The request bypasses standard financial protocols and approval processes.\n\n5. **Emotional manipulation**: The message appeals to your desire to be helpful to the CEO and suggests you've been specially trusted.\n\n6. **Unfamiliar recipient**: The receiving entity is likely not an established vendor in your system.\n\n7. **High-pressure situation**: The implication is that a business opportunity will be lost without immediate action.\n\n## Proper Response\n\n1. **Verify through alternative channels**: Contact your CEO through a known phone number or in person, not by replying to the email.\n\n2. **Follow established protocols**: Adhere to your company's standard procedures for wire transfers, which typically require multiple approvals.\n\n3. **Check the email header**: Technical staff can examine email headers to help determine if the message is spoofed.\n\n4. **Consult colleagues**: Despite the request for secrecy, financial matters typically require oversight; consult with appropriate team members.\n\n5. **Report the attempt**: Notify your IT security team about the suspected phishing email, regardless of whether you determined it was fraudulent before or after taking action.\n\n## Impact of Business Email Compromise (BEC)\n\nAccording to the FBI, BEC scams have resulted in billions of dollars in losses worldwide. These attacks specifically target businesses that routinely perform wire transfers. Unlike many phishing attempts, these emails are often well-written, researched, and tailored to the specific organization's operations and personnel.\n\nTypically, such an attack would be classified as a spear-phishing attempt combined with social engineering, specifically targeting an individual with financial authorization based on their position in the company hierarchy.\n\n## Prevention Measures\n\n1. **Implement verification procedures**: Establish multi-person approval for wire transfers and verbal confirmation policies for transfers above certain amounts.\n\n2. **Conduct regular training**: Ensure staff are aware of BEC techniques and verification procedures.\n\n3. **Create an environment where questioning is encouraged**: Staff should feel comfortable double-checking unusual requests, even from executives.\n\n4. **Deploy email authentication technologies**: Implement DMARC, SPF, and DKIM to help prevent email spoofing.\n\n5. **Establish clear financial protocols**: Define and communicate standard processes for vendor setup, payment approvals, and wire transfers.",
        difficulty: "intermediate",
        isNew: true,
        isTrending: true
      });
      
      await this.addThreatScenario({
        title: "Tailgating Security Breach",
        description: "Physical security scenario where an unauthorized person gains access to secure areas by following authorized personnel.",
        content: "# Tailgating Security Breach\n\n## Scenario Description\n\nIt's Monday morning at Acme Financial Services, a company that handles sensitive financial data for clients. You're approaching the secure entrance to your office building, access card in hand. As you scan your badge and open the door, you notice someone walking quickly behind you. They're wearing business casual clothing and carrying a coffee and laptop bag.\n\nThey smile and say, \"Thanks for holding the door! Forgot my access card at home today and IT won't be in until 9. I've got a client meeting in 15 minutes and my presentation is on my desktop.\"\n\n---\n\n## The Social Engineering Technique\n\nThis scenario depicts a classic tailgating (also called piggybacking) attempt. The unauthorized individual is attempting to gain physical access to a secure location by exploiting human courtesy and creating a believable story that:\n\n1. Explains their lack of credentials (forgotten badge)\n2. Creates urgency (upcoming client meeting)\n3. Appeals to empathy (potentially getting in trouble or disappointing a client)\n4. Suggests they legitimately belong (mentions IT department, has appropriate attire, carries expected items)\n\n## Red Flags in This Scenario\n\n1. **Unknown individual**: If you don't personally recognize this person as a colleague\n\n2. **Lack of proper authentication**: The person admits to not having their access credentials\n\n3. **Appeal to urgency**: The time pressure of an upcoming meeting is meant to bypass security protocols\n\n4. **Specific but vague details**: Mentions of IT and client meetings sound plausible but are designed to establish legitimacy\n\n5. **Exploitation of politeness**: Taking advantage of the natural inclination to hold doors open for others\n\n## Proper Response\n\n1. **Politely deny access**: \"I'm sorry, but company policy requires everyone to use their own access card. I'd be happy to direct you to the security desk or call someone to assist you.\"\n\n2. **Direct to proper channels**: Offer to escort them to reception, security desk, or call their manager or IT\n\n3. **Do not confront aggressively**: If the person becomes insistent or aggressive, don't escalate the confrontation\n\n4. **Report the incident**: Whether the person accepts your redirection or not, report the interaction to security\n\n## Impact of Tailgating\n\nTailgating breaches can lead to:\n\n- Unauthorized access to physical assets and sensitive areas\n- Theft of equipment, documents, or personal items\n- Installation of malicious hardware (keyloggers, rogue network devices)\n- Access to unlocked computers and potential data breaches\n- Corporate espionage or intellectual property theft\n\n## Prevention Measures\n\n1. **Badge visibly at all times**: Requiring visible identification helps identify who belongs\n\n2. **Challenge politely**: Create a culture where it's normal and expected to question unbadged individuals\n\n3. **Implement technical controls**: Mantrap doors, turnstiles, or security guards can reduce tailgating opportunities\n\n4. **Provide visitor management**: Clear processes for handling legitimate visitors\n\n5. **Regular security awareness training**: Train employees on how to recognize and respond to tailgating attempts\n\n6. **Simulated tailgating attempts**: Security teams can conduct authorized tests to identify vulnerabilities\n\n7. **Culture of security**: Promote an environment where security consciousness is valued over convenience\n\n## Remember\n\nTailgating exploits human psychology—nobody wants to seem rude or unhelpful. However, properly handling these situations is a professional responsibility, not a personal judgment. Organizations should create cultures where enforcing access controls is recognized as protecting the company, its data, and ultimately, its employees and customers.",
        difficulty: "beginner",
        isNew: false,
        isTrending: true
      });
      
      // Sample organization policies
      await this.addOrganizationPolicy({
        title: "Information Classification Policy",
        description: "Guidelines for classifying and handling different types of company information based on sensitivity.",
        category: "data-security",
        content: "# Information Classification Policy\n\n## 1. Purpose\n\nThis policy establishes a framework for classifying information assets based on their sensitivity, value, and criticality to the organization. Proper classification is essential to ensure that information assets receive an appropriate level of protection.\n\n## 2. Scope\n\nThis policy applies to all information created, received, transmitted, or stored by or on behalf of the organization and all employees, contractors, partners, and third parties who handle organizational information.\n\n## 3. Policy\n\n### 3.1 Classification Levels\n\nAll organizational information must be classified into one of the following categories:\n\n#### 3.1.1 Restricted\n\n**Definition**: Information that is extremely sensitive and intended for specific named individuals or roles only. Unauthorized disclosure would cause severe damage to the organization, including significant financial loss, legal penalties, or reputational damage.\n\n**Examples**:\n- Authentication credentials (passwords, private keys)\n- Personally Identifiable Information (PII) datasets\n- Payment Card Information (PCI)\n- Health information\n- Merger and acquisition plans\n- Source code for proprietary products\n- Unreleased financial results\n\n#### 3.1.2 Confidential\n\n**Definition**: Information that is sensitive within the organization and intended only for internal use. Unauthorized disclosure could cause serious damage to the organization's interests.\n\n**Examples**:\n- Business strategies and plans\n- Product development roadmaps\n- Employee performance reviews\n- Internal audit reports\n- Client lists and related data\n- Pricing strategies\n- Internal policies and procedures\n\n#### 3.1.3 Internal Use\n\n**Definition**: Information not approved for public release but generally available to all employees and authorized contractors. Unauthorized disclosure would cause minimal damage.\n\n**Examples**:\n- Internal communications\n- Meeting minutes\n- Project status updates\n- Training materials\n- Organizational charts\n- Internal telephone directories\n- Non-sensitive operational procedures\n\n#### 3.1.4 Public\n\n**Definition**: Information explicitly approved for public distribution. Dissemination outside the organization presents no risk.\n\n**Examples**:\n- Marketing materials\n- Press releases\n- Public financial reports\n- Job postings\n- Published research papers\n- Product brochures\n- Public website content\n\n### 3.2 Handling Requirements\n\n#### 3.2.1 Restricted Information\n\n- **Access**: Limited to named individuals with documented approval\n- **Storage**: Only on encrypted devices/services approved for restricted data\n- **Transmission**: Only via encrypted channels with strong authentication\n- **Disposal**: Secure destruction with documentation\n- **Marking**: Must be clearly marked \"RESTRICTED\" on all pages/screens\n\n#### 3.2.2 Confidential Information\n\n- **Access**: Limited to authorized employees and contractors with a business need\n- **Storage**: On company systems with appropriate access controls\n- **Transmission**: Via encrypted channels when transmitted electronically\n- **Disposal**: Secure shredding or deletion\n- **Marking**: Should be marked \"CONFIDENTIAL\" on all pages/screens\n\n#### 3.2.3 Internal Use Information\n\n- **Access**: Available to all employees and authorized contractors\n- **Storage**: On company systems\n- **Transmission**: May be transmitted via internal email\n- **Disposal**: Standard deletion or recycling\n- **Marking**: May be marked \"INTERNAL USE ONLY\" or similar\n\n#### 3.2.4 Public Information\n\n- **Access**: No restrictions\n- **Storage**: No special requirements\n- **Transmission**: No restrictions\n- **Disposal**: Standard disposal\n- **Marking**: No required markings\n\n### 3.3 Classification Responsibilities\n\n- **Information Owners**: Department heads or their designees who are responsible for classifying information assets under their control and ensuring proper protection\n- **Information Custodians**: IT personnel responsible for implementing the technical controls required for each classification level\n- **Information Users**: All employees who handle information and must adhere to the handling requirements for each classification level\n\n### 3.4 Reclassification and Declassification\n\nInformation classification should be reviewed periodically, especially when:\n- The information's sensitivity changes over time\n- Projects move from planning to implementation phases\n- Products move from development to public release\n- Corporate events are announced publicly\n\nReclassification must be approved by the information owner and documented appropriately.\n\n## 4. Compliance\n\nFailure to comply with this policy may result in disciplinary action, up to and including termination of employment or contract. In cases where legal requirements are violated, the organization may be obligated to report the incident to appropriate authorities.\n\n## 5. Related Documents\n\n- Data Protection Policy\n- Information Security Policy\n- Acceptable Use Policy\n- Records Retention Policy\n- Clean Desk Policy\n\n## 6. Policy Review\n\nThis policy will be reviewed annually by the Information Security Officer and updated as necessary to reflect changes in business requirements, technology, or regulatory compliance requirements.\n\n---\n\n**Policy Version**: 2.3  \n**Last Updated**: January 15, 2023  \n**Approved by**: Executive Leadership Team"
      });
      
      // Sample achievements
      await this.addAchievement({
        title: "Security Fundamentals",
        description: "Completed the basic security training modules with at least 80% accuracy.",
        icon: "shield-check",
        requiredXp: 50
      });
      
      await this.addAchievement({
        title: "Phishing Expert",
        description: "Successfully identified all phishing attempts in the advanced training module.",
        icon: "fish-off",
        requiredXp: 100
      });
      
      // Create guest user
      await this.createUser({
        username: "guest",
        firstName: "Guest",
        lastName: "User",
        email: "guest@example.com",
        password: await bcrypt.hash("guest123", 10),
        level: "BEGINNER",
        xpPoints: 10
      });
      
      console.log("Sample data initialized successfully");
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }
  
  // Helper methods to add entities to database
  private async addTrainingModule(module: InsertTrainingModule): Promise<TrainingModule> {
    const [trainingModule] = await db
      .insert(trainingModules)
      .values(module)
      .returning();
    return trainingModule;
  }
  
  private async addThreatScenario(scenario: InsertThreatScenario): Promise<ThreatScenario> {
    const [threatScenario] = await db
      .insert(threatScenarios)
      .values(scenario)
      .returning();
    return threatScenario;
  }
  
  private async addOrganizationPolicy(policy: InsertOrganizationPolicy): Promise<OrganizationPolicy> {
    const [organizationPolicy] = await db
      .insert(organizationPolicies)
      .values(policy)
      .returning();
    return organizationPolicy;
  }
  
  private async addAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievement)
      .returning();
    return newAchievement;
  }
  
  // IStorage implementation methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        level: insertUser.level || "BEGINNER",
        xpPoints: insertUser.xpPoints || 0,
        completedModules: 0,
        createdAt: new Date()
      })
      .returning();
    return user;
  }
  
  async getTrainingModules(): Promise<TrainingModule[]> {
    return await db
      .select()
      .from(trainingModules)
      .orderBy(asc(trainingModules.order));
  }
  
  async getTrainingModule(id: number): Promise<TrainingModule | undefined> {
    const [module] = await db
      .select()
      .from(trainingModules)
      .where(eq(trainingModules.id, id));
    return module;
  }
  
  async getNextRecommendedModules(userId: number, limit: number = 2): Promise<TrainingModule[]> {
    // Get completed module IDs for this user
    const completedUserProgress = await db
      .select({ moduleId: userProgress.moduleId })
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.completed, true)
      ));
    
    const completedModuleIds = completedUserProgress.map(p => p.moduleId);
    
    // Get modules that the user hasn't completed yet
    let moduleQuery = db
      .select()
      .from(trainingModules)
      .orderBy(asc(trainingModules.order));
    
    if (completedModuleIds.length > 0) {
      moduleQuery = moduleQuery.where(
        not(sql`${trainingModules.id} IN (${completedModuleIds.join(',')})`)
      );
    }
    
    // Limit results if needed
    if (limit) {
      moduleQuery = moduleQuery.limit(limit);
    }
    
    return await moduleQuery;
  }
  
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
  }
  
  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const [userProgressRecord] = await db
      .insert(userProgress)
      .values({
        ...progress,
        completedAt: progress.completed ? new Date() : null
      })
      .returning();
    
    // Update user's XP points if the module was completed
    if (progress.completed) {
      const module = await this.getTrainingModule(progress.moduleId);
      if (module) {
        const user = await this.getUser(progress.userId);
        if (user) {
          // Update user with new XP and potentially new level
          const newXpPoints = user.xpPoints + module.xpReward;
          const newCompletedModules = (user.completedModules || 0) + 1;
          
          // Determine new level based on XP
          let newLevel = user.level;
          if (newXpPoints >= 500) {
            newLevel = "ADVANCED";
          } else if (newXpPoints >= 200) {
            newLevel = "INTERMEDIATE";
          }
          
          await db
            .update(users)
            .set({
              xpPoints: newXpPoints,
              completedModules: newCompletedModules,
              level: newLevel
            })
            .where(eq(users.id, user.id));
        }
      }
    }
    
    return userProgressRecord;
  }
  
  async getCompletedModulesCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.completed, true)
      ));
    
    return Number(result[0].count) || 0;
  }
  
  async getThreatScenarios(limit?: number): Promise<ThreatScenario[]> {
    let query = db
      .select()
      .from(threatScenarios)
      .orderBy(desc(threatScenarios.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  async getThreatScenario(id: number): Promise<ThreatScenario | undefined> {
    const [scenario] = await db
      .select()
      .from(threatScenarios)
      .where(eq(threatScenarios.id, id));
    return scenario;
  }
  
  async getOrganizationPolicies(limit?: number): Promise<OrganizationPolicy[]> {
    let query = db
      .select()
      .from(organizationPolicies)
      .orderBy(desc(organizationPolicies.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  async getOrganizationPolicy(id: number): Promise<OrganizationPolicy | undefined> {
    const [policy] = await db
      .select()
      .from(organizationPolicies)
      .where(eq(organizationPolicies.id, id));
    return policy;
  }
  
  async getChatMessages(userId: number, limit: number = 50): Promise<ChatMessage[]> {
    let query = db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(asc(chatMessages.timestamp));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return chatMessage;
  }
  
  async getAchievements(): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements);
  }
  
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return achievement;
  }
  
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
  }
  
  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [newUserAchievement] = await db
      .insert(userAchievements)
      .values(userAchievement)
      .returning();
    return newUserAchievement;
  }
}

// Export a singleton instance for use in the application
export const storage: IStorage = new DatabaseStorage();