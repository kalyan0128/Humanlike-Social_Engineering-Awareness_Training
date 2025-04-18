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
  addTrainingModule(module: InsertTrainingModule): Promise<TrainingModule>;
  
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
      
      await this.addTrainingModule({
        title: "Password Security Quiz",
        description: "Test your knowledge of password security best practices.",
        type: "quiz",
        difficulty: "beginner",
        content: JSON.stringify({
          introduction: "This quiz will test your knowledge of password security best practices to help ensure your accounts remain protected.",
          questions: [
            {
              id: 1,
              question: "What is the recommended minimum length for a strong password?",
              options: [
                "8 characters",
                "10 characters",
                "12 characters",
                "16 characters"
              ],
              correctAnswer: 2,
              explanation: "Security experts recommend passwords be at least 12 characters long. Longer passwords are exponentially harder to crack than shorter ones."
            },
            {
              id: 2,
              question: "Which of the following would be considered the strongest password?",
              options: [
                "Password123!",
                "p@$$w0rd",
                "ilovemydog2023",
                "Tr%v3l*t0-P@r!s-2023"
              ],
              correctAnswer: 3,
              explanation: "The strongest password uses a mix of uppercase letters, lowercase letters, numbers, special characters, and is of sufficient length while not using common words or patterns."
            },
            {
              id: 3,
              question: "What is a passphrase?",
              options: [
                "Another term for password",
                "A short password used for less important accounts",
                "A sequence of words or text used to control access",
                "A password shared among team members"
              ],
              correctAnswer: 2,
              explanation: "A passphrase is a sequence of words or other text used to control access. They're often longer than traditional passwords but easier to remember, like 'correct-horse-battery-staple'."
            },
            {
              id: 4,
              question: "Which of the following is NOT a recommended password practice?",
              options: [
                "Using different passwords for different accounts",
                "Writing down passwords in a secure location",
                "Using a password manager",
                "Changing passwords only when required by the system"
              ],
              correctAnswer: 3,
              explanation: "While systems may force password changes, waiting until required isn't ideal. Regularly update passwords for sensitive accounts, and immediately change any password you suspect might be compromised."
            },
            {
              id: 5,
              question: "What is the main benefit of using a password manager?",
              options: [
                "It automatically logs you into all your accounts",
                "It allows you to use simpler passwords",
                "It helps you create and store unique, complex passwords for different accounts",
                "It makes password sharing with colleagues easier"
              ],
              correctAnswer: 2,
              explanation: "Password managers help you generate, store, and manage unique, complex passwords for all your accounts, meaning you don't have to remember them all. This promotes better password hygiene."
            }
          ]
        }),
        xpReward: 20,
        order: 4
      });
      
      await this.addTrainingModule({
        title: "Social Media Security",
        description: "Learn how to protect your personal information on social media platforms.",
        type: "article",
        difficulty: "intermediate",
        content: "# Social Media Security\n\n## Introduction\n\nSocial media platforms have become an integral part of our personal and professional lives. However, they also present significant security and privacy risks if not used carefully. This module covers essential security practices for social media usage.\n\n## Privacy Risks on Social Media\n\nWhen using social media, be aware of these common privacy risks:\n\n1. **Oversharing personal information** that could be used for identity theft or targeted attacks\n2. **Location data exposure** through check-ins or geotagged photos\n3. **Metadata in photos** that may reveal more than the image itself\n4. **Third-party applications** connected to your social accounts\n5. **Data harvesting** by platforms for advertising and other purposes\n\n## Essential Security Practices\n\n### Account Security\n\n1. **Use strong, unique passwords** for each social media account\n2. **Enable two-factor authentication** whenever available\n3. **Regularly review connected apps and devices**\n4. **Be cautious of recovery options** that could be exploited\n5. **Log out** when using shared or public computers\n\n### Privacy Settings\n\n1. **Review and adjust privacy settings regularly**\n   - Platforms often update their privacy options and may reset or change your settings\n   - Check who can see your posts, photos, friends list, and personal information\n\n2. **Control post visibility**\n   - Understand the difference between public, friends-only, and custom audience settings\n   - Consider using friend lists or circles to share certain content with specific groups\n\n3. **Limit profile discoverability**\n   - Control how people can find and contact you\n   - Consider whether your profile should appear in search engines\n\n### Content Sharing Best Practices\n\n1. **Think before you share**\n   - Once information is online, it can be difficult or impossible to completely remove\n   - Consider how information could be used by others with malicious intent\n\n2. **Be mindful of sensitive information**\n   - Avoid sharing identification documents, financial details, or complete birth dates\n   - Be careful with information that might answer security questions (mother's maiden name, first pet, etc.)\n\n3. **Consider the timing of posts**\n   - Announcing travel plans can signal an empty home to potential burglars\n   - Consider posting about trips after you've returned\n\n4. **Review tagged photos and check-ins**\n   - Enable tag review features when available\n   - Ask friends not to tag your location without permission\n\n## Recognizing Social Engineering on Social Media\n\n### Common Tactics\n\n1. **Fake profiles**: Impersonation of friends, colleagues, or organizations\n2. **Phishing links**: Deceptive messages or posts containing malicious links\n3. **Quizzes and games**: Seemingly innocent activities designed to harvest personal data\n4. **Friend/connection requests** from unknown individuals\n5. **Suspicious direct messages** requesting personal information or containing unexpected links\n\n### Protection Strategies\n\n1. **Verify unusual requests** through alternative channels\n2. **Don't click on suspicious links**, even if they appear to come from friends\n3. **Research apps and quizzes** before granting access to your profile\n4. **Be selective with friend/connection requests**\n5. **Report suspicious activity** to the platform\n\n## Workplace Considerations\n\n1. **Follow your organization's social media policy**\n2. **Be careful discussing work projects** or sharing workplace photos\n3. **Consider separation between professional and personal accounts**\n4. **Understand how your posts might reflect on your employer**\n5. **Be aware of information that could be valuable to competitors**\n\n## Recovery from Compromise\n\nIf you suspect your social media account has been compromised:\n\n1. **Change your password immediately**\n2. **Check for unauthorized posts or messages**\n3. **Review and revoke access for unknown apps or devices**\n4. **Enable additional security features**\n5. **Alert your connections** if necessary\n6. **Report the incident** to the platform\n\n## Conclusion\n\nSocial media offers valuable ways to connect and share, but requires conscious attention to security and privacy. By implementing these best practices, you can enjoy the benefits while minimizing risks to your personal and professional information.",
        xpReward: 25,
        order: 5
      });
      
      await this.addTrainingModule({
        title: "Social Media Security Quiz",
        description: "Test your knowledge of social media security best practices.",
        type: "quiz",
        difficulty: "intermediate",
        content: JSON.stringify({
          introduction: "This quiz will test your knowledge of social media security best practices and help you identify potential risks when using social platforms.",
          questions: [
            {
              id: 1,
              question: "Which of the following is NOT recommended for social media account security?",
              options: [
                "Using the same password as your email for convenience",
                "Enabling two-factor authentication",
                "Regularly reviewing connected applications",
                "Checking privacy settings after platform updates"
              ],
              correctAnswer: 0,
              explanation: "You should never reuse passwords across different accounts, especially between email and social media. If one account is compromised, attackers would gain access to both."
            },
            {
              id: 2,
              question: "Why might 'social media quizzes' pose a security risk?",
              options: [
                "They take up too much time",
                "They often collect data that could be used to guess your security questions",
                "They might install malware directly",
                "They're designed to make you look foolish"
              ],
              correctAnswer: 1,
              explanation: "Many social media quizzes ask questions that are similar to common security questions (first pet, mother's maiden name, first car, etc.). This information could be used for identity theft or to gain access to your accounts."
            },
            {
              id: 3,
              question: "What is 'geotagging' and why is it a potential security concern?",
              options: [
                "Adding friends based on location - it's not a security concern",
                "Adding your location to posts/photos - reveals your whereabouts and patterns",
                "Categorizing friends by location - could reveal your social connections",
                "Using location-based services - these are always secure"
              ],
              correctAnswer: 1,
              explanation: "Geotagging is the practice of adding location data to social media posts or photos. This can reveal patterns of movement, when you're away from home, or other sensitive location information that could be exploited."
            },
            {
              id: 4,
              question: "Which information is generally safest to share on public social media profiles?",
              options: [
                "Your full birth date including year",
                "Your personal email address",
                "Vacation photos (after you've returned home)",
                "Phone number for two-factor authentication"
              ],
              correctAnswer: 2,
              explanation: "Sharing vacation photos after you've returned home is safer than announcing plans in advance or posting while away. The other options expose personal information that could be used for identity theft or targeted attacks."
            },
            {
              id: 5,
              question: "What should you do if you receive an unusual request from a friend on social media?",
              options: [
                "Immediately do what they ask - they're your friend",
                "Verify the request through another channel, like a phone call",
                "Report them to the platform immediately",
                "Ask other mutual friends if they got the same request"
              ],
              correctAnswer: 1,
              explanation: "If you receive an unusual or suspicious request, even from someone who appears to be a friend, verify through a different communication channel. Their account may have been compromised or impersonated."
            }
          ]
        }),
        xpReward: 30,
        order: 6
      });
      
      await this.addTrainingModule({
        title: "Mobile Device Security",
        description: "Essential practices for securing smartphones and tablets against cyber threats.",
        type: "article",
        difficulty: "advanced",
        content: "# Mobile Device Security\n\n## Introduction\n\nMobile devices store vast amounts of personal and professional data, making them prime targets for cyber attacks. This module covers essential security practices to protect your smartphones and tablets from various threats.\n\n## Understanding Mobile Security Threats\n\n### Common Attack Vectors\n\n1. **Malicious Applications**: Apps that appear legitimate but contain malware\n2. **Unsecured Networks**: Public Wi-Fi networks that can be monitored by attackers\n3. **Phishing Attacks**: SMS, email, or messaging-based attempts to steal credentials\n4. **Device Theft**: Physical theft leading to data compromise\n5. **Operating System Vulnerabilities**: Security flaws in outdated software\n6. **Bluetooth Vulnerabilities**: Attacks targeting Bluetooth connections\n\n## Essential Security Practices\n\n### Device Protection\n\n1. **Use Strong Authentication**\n   - Enable biometric authentication (fingerprint, face recognition) when available\n   - Use a strong PIN or password (avoid simple patterns or sequences)\n   - Consider using complex passwords for sensitive applications\n\n2. **Keep Software Updated**\n   - Install operating system updates promptly\n   - Enable automatic updates when possible\n   - Update apps regularly to patch security vulnerabilities\n\n3. **Encrypt Your Device**\n   - Enable full-device encryption (typically enabled by default on newer devices)\n   - Ensure SD cards or external storage are also encrypted if they contain sensitive data\n\n4. **Use Remote Tracking and Wiping**\n   - Enable \"Find My Device\" or equivalent features\n   - Configure remote wiping capabilities for lost or stolen devices\n   - Test these features before you need them\n\n### Application Security\n\n1. **Download from Official Sources**\n   - Use official app stores (Google Play Store, Apple App Store)\n   - Avoid sideloading apps from unknown sources\n   - Research developers before installing unfamiliar apps\n\n2. **Review App Permissions**\n   - Check what data and device features apps request access to\n   - Question why apps need specific permissions (e.g., why would a flashlight app need your contacts?)\n   - Regularly audit and revoke unnecessary permissions\n\n3. **Be Wary of Free Apps**\n   - Understand that \"free\" apps often monetize through data collection\n   - Consider paying for privacy-focused alternatives to free services\n   - Read privacy policies to understand how your data is used\n\n### Network Security\n\n1. **Use Cellular Data for Sensitive Activities**\n   - Avoid banking, shopping, or accessing sensitive accounts on public Wi-Fi\n   - Use your cellular data connection when security is a priority\n\n2. **Use a VPN**\n   - Install a reputable VPN app for use on public networks\n   - Ensure your VPN is activated before connecting to public Wi-Fi\n   - Be aware that free VPNs may collect and sell your data\n\n3. **Disable Auto-Connect Features**\n   - Turn off automatic connection to open Wi-Fi networks\n   - Disable Bluetooth when not in use\n   - Use Airplane Mode in sensitive locations\n\n### Data Protection\n\n1. **Back Up Regularly**\n   - Configure automatic backups to cloud services or local storage\n   - Encrypt backups when possible\n   - Test restore functionality periodically\n\n2. **Use Secure Communication Apps**\n   - Prefer messaging apps with end-to-end encryption\n   - Be aware of which communications are encrypted and which aren't\n   - Consider using Signal, WhatsApp, or other secure messaging platforms for sensitive communications\n\n3. **Manage Account Access**\n   - Use different passwords for different services\n   - Enable two-factor authentication for important accounts\n   - Regularly review account activity and connected applications\n\n## Advanced Protection Measures\n\n### For High-Risk Individuals\n\n1. **Consider a Security-Focused Device**\n   - Some devices prioritize security features over convenience\n   - Separate personal and high-security activities to different devices\n\n2. **Use Security Keys**\n   - Hardware security keys provide stronger authentication than SMS-based 2FA\n   - Compatible with many major services and applications\n\n3. **Compartmentalize Information**\n   - Use different apps or user profiles for different purposes\n   - Consider work/personal separation on devices\n\n### Enterprise Considerations\n\n1. **Mobile Device Management (MDM)**\n   - Understand your organization's MDM policies\n   - Be aware of what data and activities your employer can monitor\n   - Follow organizational security guidelines\n\n2. **Containerization**\n   - Work apps may use containerization to separate work and personal data\n   - Understand the boundaries between personal and professional environments\n\n## When Traveling\n\n1. **Minimize Sensitive Data**\n   - Consider using a dedicated travel device with minimal personal information\n   - Remove unnecessary apps and data before crossing borders\n\n2. **Be Aware of Legal Considerations**\n   - Different countries have different laws regarding encryption and privacy\n   - Some countries may require device inspection at borders\n\n3. **Physical Security**\n   - Maintain visual contact with your devices\n   - Use hotel safes with caution (they're not always secure)\n   - Consider privacy screens to prevent visual snooping\n\n## Responding to Compromise\n\nIf you suspect your device has been compromised:\n\n1. **Disconnect from networks**\n2. **Change critical passwords from a different device**\n3. **Contact your IT department or security professional**\n4. **Consider a factory reset after backing up essential data**\n5. **Monitor accounts for suspicious activity**\n\n## Conclusion\n\nMobile device security requires ongoing attention and a balance between convenience and protection. By implementing these practices, you can significantly reduce the risk of compromise while still enjoying the benefits of mobile technology.",
        xpReward: 40,
        order: 7
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
      
      await this.addThreatScenario({
        title: "Vishing Attack: Tech Support Scam",
        description: "A voice phishing scenario where the attacker impersonates IT support to gain system access.",
        content: "# Vishing Attack: Tech Support Scam\n\n## Scenario Description\n\nYou're working at your desk when your desk phone rings. You answer and the caller introduces himself as Marcus from the IT department.\n\n**Caller**: \"Hi, this is Marcus from IT Security. We've detected some unusual network traffic coming from your computer that looks like it might be malware trying to access our financial systems. Have you noticed your computer running slower than usual today?\"\n\n**You**: [Whether you answer yes or no]\n\n**Caller**: \"That's consistent with what we're seeing. Listen, we need to clean this up right away before it spreads to other systems or accesses sensitive data. I can help you remove it remotely, but I need you to go to a website so I can get secure access to your computer. Can you open your web browser and go to support-connect.com?\"\n\n**You**: [If you express hesitation]\n\n**Caller**: \"I understand your caution, but this is urgent. The malware is attempting to access our payroll database right now. Look, I can verify I'm legitimate - your computer asset tag is GF638291, you're running Windows 10, and you're located on the third floor, right? This will only take five minutes, and if we don't address it immediately, I'll have to escalate this to your manager as a security incident. Can you please go to support-connect.com while I stay on the line?\"\n\n---\n\n## The Social Engineering Technique\n\nThis is a vishing (voice phishing) attack where the attacker is:\n\n1. **Impersonating authority**: Claiming to be from IT Security gives the caller an aura of legitimacy and authority\n2. **Creating urgency**: The threat of malware creating immediate damage pressures the victim to act quickly\n3. **Instilling fear**: Mentions of malware, data breaches, and escalation to management play on fear\n4. **Demonstrating insider knowledge**: Mentions of generic details (asset tag, OS, location) suggest legitimacy\n5. **Offering help**: Positioning themselves as helping you rather than asking for something\n\n## Red Flags in This Scenario\n\n1. **Unsolicited call**: A legitimate IT department typically uses ticketing systems or email for initial contact\n\n2. **Urgency and pressure**: The caller creates an artificial time pressure and sense of urgency\n\n3. **Requesting remote access**: Asking you to visit a website to give them control of your computer\n\n4. **Vague technical language**: Uses generic terms about \"unusual traffic\" and \"malware\" without specifics\n\n5. **Threatening consequences**: Mentioning escalation to management as a pressure tactic\n\n6. **Generic information**: The details they provide could be obtained through basic research or social media\n\n## Proper Response\n\n1. **Verify the caller's identity**: \"I'll call you back through our company directory\" - do not use a number they provide\n\n2. **Consult official channels**: Check with the IT helpdesk through official contact methods\n\n3. **Don't visit unknown websites**: Never navigate to unfamiliar websites at the direction of unexpected callers\n\n4. **Report the incident**: Inform your actual IT security team about the call\n\n5. **Don't share credentials**: Never provide passwords or authentication codes over the phone\n\n## Impact of Tech Support Vishing\n\nIf successful, this attack could lead to:\n\n1. **Remote access installation**: The attacker gains complete control over your computer\n\n2. **Data theft**: Sensitive files, emails, and credentials could be stolen\n\n3. **Malware installation**: Backdoors, keyloggers, or ransomware could be installed\n\n4. **Network penetration**: Once inside your system, attackers may pivot to other systems\n\n5. **Financial losses**: Direct theft or fraudulent transactions\n\n## Prevention Measures\n\n1. **Verify through official channels**: Always validate IT support contacts through known company directories\n\n2. **Implement callback procedures**: Establish a policy of ending unexpected calls and calling back through official numbers\n\n3. **Create a verification system**: Use internal ticket numbers or other verification systems for legitimate IT interactions\n\n4. **Train employees**: Regular security awareness training about vishing tactics\n\n5. **Report suspicious calls**: Encourage immediate reporting of suspicious contacts\n\n## Remember\n\nLegitimate IT departments understand security concerns and will respect verification procedures. They typically:\n\n- Use ticketing systems to track issues\n- Provide specific details about the technical issue\n- Don't pressure employees or create artificial urgency\n- Don't ask for passwords over the phone\n- Use company-approved remote access tools, not third-party websites\n\nWhen in doubt, it's always better to take the extra time to verify than to risk compromising your system and the organization's security.",
        difficulty: "intermediate",
        isNew: true,
        isTrending: false
      });
      
      await this.addThreatScenario({
        title: "QR Code Phishing Attack",
        description: "A modern phishing scenario using QR codes to direct victims to malicious websites.",
        content: "# QR Code Phishing Attack\n\n## Scenario Description\n\nYou receive an official-looking email from what appears to be your company's HR department. The email has the company logo and formatting that matches internal communications.\n\n---\n\n**From:** Human Resources <hr-benefits@company-portal.net>  \n**Subject:** Important: New Employee Benefits Portal Access  \n**Date:** Monday, 9:32 AM\n\nDear Employee,\n\nAs part of our ongoing digital transformation initiatives, we've upgraded our employee benefits portal with enhanced security and new features. To access the new system, all employees must re-authenticate their accounts by April 30th.\n\nTo make this process seamless, simply scan the QR code below using your smartphone camera. This will direct you to the secure authentication page where you can verify your identity and set up your new portal access.\n\n[QR CODE IMAGE]\n\nImportant: Failure to complete this verification by the deadline will result in temporary suspension of access to benefits information and possible delays in benefits administration.\n\nIf you have any questions, please contact the HR helpdesk at extension 4577.\n\nBest regards,\nHuman Resources Department\n\n---\n\n## The Social Engineering Technique\n\nThis attack uses QR code phishing (sometimes called \"quishing\"), a technique where attackers combine traditional phishing tactics with QR codes to:\n\n1. **Obscure the destination URL**: Unlike a text link, recipients cannot preview where a QR code will send them\n2. **Bypass email security**: Many email security tools scan links but may not analyze embedded QR codes\n3. **Exploit mobile contexts**: QR codes are scanned on mobile devices, which often have smaller screens and may not display security indicators as clearly\n4. **Create false legitimacy**: QR codes are increasingly used in legitimate business communications\n\n## Red Flags in This Scenario\n\n1. **Sender domain mismatch**: The email comes from \"company-portal.net\" rather than your actual company domain\n\n2. **Urgency and consequences**: The message creates an artificial deadline with negative consequences\n\n3. **Requesting re-authentication**: Legitimate system upgrades typically don't require all users to re-authenticate\n\n4. **QR code for authentication**: Companies typically use web links or direct portal access for authentication, not QR codes\n\n5. **Limited contact options**: Only provides an extension number rather than an email for questions\n\n## Proper Response\n\n1. **Don't scan the QR code**: Avoid scanning QR codes from unexpected emails\n\n2. **Verify through official channels**: Access your benefits portal through your company's official intranet or bookmarked link\n\n3. **Contact HR directly**: Use known contact information (not what's provided in the email) to verify if there's actually a new portal\n\n4. **Check the sender details**: Examine the full email address for inconsistencies\n\n5. **Report the phishing attempt**: Forward the email to your IT security team\n\n## Impact of QR Code Phishing\n\nIf successful, this attack could lead to:\n\n1. **Credential theft**: The QR code may lead to a convincing but fake login page that captures your credentials\n\n2. **Malware infection**: Some QR codes may direct to sites that attempt to install malware\n\n3. **Account compromise**: With valid credentials, attackers could access sensitive personal information in your benefits account\n\n4. **Further attacks**: Initial access could enable more sophisticated follow-up attacks\n\n## Prevention Measures\n\n1. **Verify QR destinations**: Use a QR scanner app that previews the URL before navigating\n\n2. **Approach QR codes cautiously**: Treat QR codes with the same skepticism as links in emails\n\n3. **Access portals directly**: Bookmark important websites and access them directly rather than through links or QR codes\n\n4. **Use multi-factor authentication**: This provides an additional layer of protection even if credentials are compromised\n\n5. **QR code education**: Include QR-based attacks in security awareness training\n\n## Remember\n\nQR codes provide convenience but also obscure the destination URL. Always verify where a QR code will send you before allowing it to open a website, especially when received in unexpected communications. When in doubt, access important portals directly through trusted bookmarks or company intranets rather than through QR codes or links in messages.",
        difficulty: "intermediate",
        isNew: true,
        isTrending: true
      });
      
      await this.addThreatScenario({
        title: "USB Drop Attack",
        description: "A physical security scenario where attackers use strategically placed flash drives to deliver malware.",
        content: "# USB Drop Attack\n\n## Scenario Description\n\nYou've just parked your car in the company parking lot and are walking toward the building when you notice a USB flash drive on the ground near the entrance. The drive has your company logo printed on it and a label that reads \"Confidential - Q4 Salary Reviews.\"\n\nLater that day, you also notice a USB drive left in the break room with a label that says \"Company Holiday Party Photos\" and another near the printer labeled \"Executive Presentation - Upcoming Merger.\"\n\n---\n\n## The Social Engineering Technique\n\nThis scenario illustrates a USB drop attack (also called \"baiting\"), where attackers strategically place malicious USB drives in locations where they're likely to be found by target organization employees. The attack works by:\n\n1. **Exploiting curiosity**: Using enticing labels that appeal to human curiosity, financial interest, or social needs\n2. **Targeting specific environments**: Placing devices in locations frequented by employees\n3. **Creating legitimate appearance**: Branding devices with company logos to appear authentic\n4. **Leveraging automatic execution**: Relying on autorun features or disguising malicious content\n5. **Bypassing perimeter security**: Using physical media to avoid network security controls\n\n## Red Flags in This Scenario\n\n1. **Unexpected discovery**: Finding storage devices in unusual locations\n\n2. **Enticing labels**: Labels designed to provoke curiosity or suggest valuable content\n\n3. **Multiple devices**: Several drives appearing in different locations suggests a systematic campaign\n\n4. **Sensitive content labels**: References to confidential information like salary data or merger plans\n\n5. **Inconsistency with company practices**: Most organizations have secure digital methods for sharing sensitive information\n\n## Proper Response\n\n1. **Don't connect the device**: Never insert unknown USB drives into your computer\n\n2. **Report to security**: Turn the device over to your IT security team without connecting it\n\n3. **Document the discovery**: Note where and when you found the device\n\n4. **Alert colleagues**: Warn others not to use any found USB devices\n\n5. **Follow company protocol**: Adhere to your organization's policies for handling suspicious items\n\n## Impact of USB Drop Attacks\n\nIf successful, these attacks can lead to:\n\n1. **Malware infection**: Automatic execution of malware when the device is connected\n\n2. **Data exfiltration**: Malware that steals sensitive data from connected systems\n\n3. **Network penetration**: Establishment of backdoors for ongoing access\n\n4. **Credential theft**: Installation of keyloggers to capture usernames and passwords\n\n5. **Ransomware deployment**: Encryption of files or systems for ransom demands\n\n## How USB Attacks Work Technically\n\nUSB drop attacks can utilize several technical mechanisms:\n\n1. **Autorun malware**: Although less effective with modern OS security, some systems may still automatically execute content\n\n2. **Malicious documents**: Files that exploit vulnerabilities in document readers when opened\n\n3. **Human-interface device spoofing**: Some advanced USB attacks can emulate keyboards to execute commands\n\n4. **Social engineering payloads**: Files that require human interaction but deceive users into enabling malicious content\n\n## Prevention Measures\n\n1. **Establish clear policies**: Create and communicate policies prohibiting the use of unknown USB devices\n\n2. **Disable autorun**: Ensure autorun features are disabled across the organization\n\n3. **Use device control software**: Implement solutions that restrict or monitor USB usage\n\n4. **Deploy endpoint protection**: Use security solutions that scan removable media\n\n5. **Regular security awareness**: Train employees to recognize and properly respond to baiting attacks\n\n6. **Provide alternatives**: Ensure employees have secure, convenient methods for file transfers and sharing\n\n## Remember\n\nUSB drop attacks remain effective despite their simplicity because they exploit human curiosity and bypass network security controls. While the discovery of a USB drive may seem innocuous, it represents a potential security threat that should be handled with caution. Always report found devices to security personnel without connecting them to any system, regardless of how interesting or relevant the labeled content may appear.",
        difficulty: "beginner",
        isNew: false,
        isTrending: true
      });
      
      await this.addThreatScenario({
        title: "Deep Fake Video Call Scam",
        description: "An advanced social engineering attack using AI-generated video to impersonate executives.",
        content: "# Deep Fake Video Call Scam\n\n## Scenario Description\n\nYou're a finance team member at a mid-sized company. At 4:30 PM on Friday, you receive an urgent Microsoft Teams message from what appears to be your CFO's account:\n\n\"I need your help with an urgent wire transfer. Can you jump on a quick video call?\"\n\nYou accept the call and see your CFO on video. He explains that he's at an airport lounge finalizing a confidential acquisition, but experiencing technical difficulties with his banking portal. He needs you to immediately wire $175,000 to complete the deal before markets close. He emphasizes this is extremely time-sensitive and confidential.\n\nDuring the call, he provides wire transfer details and stresses that this must be kept confidential until Monday's official announcement. He mentions a few company-specific details and references your recent team meeting about quarterly results.\n\n---\n\n## The Social Engineering Technique\n\nThis scenario demonstrates an advanced deep fake attack combining several techniques:\n\n1. **AI-generated video impersonation**: Using deep fake technology to create realistic video of the CFO\n2. **Account compromise**: Gaining access to the executive's messaging account\n3. **Pressure tactics**: Creating urgency with end-of-day timing and market deadlines\n4. **Confidentiality manipulation**: Using secrecy requirements to prevent verification\n5. **Contextual knowledge**: Including specific company details to increase credibility\n\n## Red Flags in This Scenario\n\n1. **Unexpected urgent request**: Financial executives rarely make last-minute, urgent wire requests\n\n2. **Bypass of financial controls**: The request circumvents standard financial approval processes\n\n3. **Pressure elements**: End of week timing, imminent deadlines, and urgent language\n\n4. **Confidentiality emphasis**: Requesting secrecy to prevent normal verification channels\n\n5. **Technical difficulties excuse**: Claiming technical problems to explain why the executive can't perform the task directly\n\n6. **Video call anomalies**: Possible subtle issues with lip synchronization, facial movements, or audio quality\n\n## Proper Response\n\n1. **Follow established protocols**: Adhere to company financial policies regardless of apparent urgency\n\n2. **Verify through alternative channels**: Contact the CFO through a different verified method (cell phone number from company directory)\n\n3. **Involve other stakeholders**: Consult with team members or other executives despite confidentiality requests\n\n4. **Check for deep fake indicators**: Pay attention to unnatural movements, audio-visual sync issues, or inconsistent backgrounds\n\n5. **Delay if uncertain**: Legitimate business needs rarely hinge on immediate, same-day transfers\n\n## Impact of Deep Fake Financial Scams\n\nIf successful, these attacks can result in:\n\n1. **Direct financial loss**: Immediate theft of transferred funds\n\n2. **Reputational damage**: Both to the company and to employees involved\n\n3. **Regulatory consequences**: Potential violations of financial controls and reporting requirements\n\n4. **Further compromise**: Establishing precedent for future fraudulent requests\n\n## Technical Aspects of Deep Fake Technology\n\n1. **Current capabilities**: Modern AI can create convincing video and audio impersonations with minimal source material\n\n2. **Limitations**: Deep fakes may still show artifacts like unusual blinking patterns, lighting inconsistencies, or audio anomalies\n\n3. **Accessibility**: Deep fake technology has become increasingly accessible, requiring less technical expertise\n\n4. **Evolution**: The technology is rapidly improving, making detection increasingly difficult\n\n## Prevention Measures\n\n1. **Implement verification protocols**: Establish multi-factor, multi-channel verification for financial requests\n\n2. **Create authentication questions**: Develop personal verification questions that wouldn't be known from public information\n\n3. **Enforce financial controls**: Maintain strict approval processes regardless of seniority or urgency\n\n4. **Conduct deep fake awareness training**: Educate employees about this emerging threat\n\n5. **Develop verification codes**: Implement one-time verification codes or phrases for sensitive communications\n\n6. **Use secure financial platforms**: Utilize financial systems with built-in approval workflows rather than email or messaging requests\n\n## Remember\n\nDeep fake technology is becoming increasingly sophisticated and accessible. While video calls have traditionally been considered more secure than email or voice calls, advances in AI-generated media mean that seeing and hearing someone is no longer sufficient verification. Always follow established financial protocols and verify unusual requests through multiple channels, regardless of how convincing the requester appears to be.",
        difficulty: "advanced",
        isNew: true,
        isTrending: false
      });
      
      // Sample organization policies
      await this.addOrganizationPolicy({
        title: "Information Classification Policy",
        description: "Guidelines for classifying and handling different types of company information based on sensitivity.",
        category: "data-security",
        icon: "FileText",
        content: "# Information Classification Policy\n\n## 1. Purpose\n\nThis policy establishes a framework for classifying information assets based on their sensitivity, value, and criticality to the organization. Proper classification is essential to ensure that information assets receive an appropriate level of protection.\n\n## 2. Scope\n\nThis policy applies to all information created, received, transmitted, or stored by or on behalf of the organization and all employees, contractors, partners, and third parties who handle organizational information.\n\n## 3. Policy\n\n### 3.1 Classification Levels\n\nAll organizational information must be classified into one of the following categories:\n\n#### 3.1.1 Restricted\n\n**Definition**: Information that is extremely sensitive and intended for specific named individuals or roles only. Unauthorized disclosure would cause severe damage to the organization, including significant financial loss, legal penalties, or reputational damage.\n\n**Examples**:\n- Authentication credentials (passwords, private keys)\n- Personally Identifiable Information (PII) datasets\n- Payment Card Information (PCI)\n- Health information\n- Merger and acquisition plans\n- Source code for proprietary products\n- Unreleased financial results\n\n#### 3.1.2 Confidential\n\n**Definition**: Information that is sensitive within the organization and intended only for internal use. Unauthorized disclosure could cause serious damage to the organization's interests.\n\n**Examples**:\n- Business strategies and plans\n- Product development roadmaps\n- Employee performance reviews\n- Internal audit reports\n- Client lists and related data\n- Pricing strategies\n- Internal policies and procedures\n\n#### 3.1.3 Internal Use\n\n**Definition**: Information not approved for public release but generally available to all employees and authorized contractors. Unauthorized disclosure would cause minimal damage.\n\n**Examples**:\n- Internal communications\n- Meeting minutes\n- Project status updates\n- Training materials\n- Organizational charts\n- Internal telephone directories\n- Non-sensitive operational procedures\n\n#### 3.1.4 Public\n\n**Definition**: Information explicitly approved for public distribution. Dissemination outside the organization presents no risk.\n\n**Examples**:\n- Marketing materials\n- Press releases\n- Public financial reports\n- Job postings\n- Published research papers\n- Product brochures\n- Public website content\n\n### 3.2 Handling Requirements\n\n#### 3.2.1 Restricted Information\n\n- **Access**: Limited to named individuals with documented approval\n- **Storage**: Only on encrypted devices/services approved for restricted data\n- **Transmission**: Only via encrypted channels with strong authentication\n- **Disposal**: Secure destruction with documentation\n- **Marking**: Must be clearly marked \"RESTRICTED\" on all pages/screens\n\n#### 3.2.2 Confidential Information\n\n- **Access**: Limited to authorized employees and contractors with a business need\n- **Storage**: On company systems with appropriate access controls\n- **Transmission**: Via encrypted channels when transmitted electronically\n- **Disposal**: Secure shredding or deletion\n- **Marking**: Should be marked \"CONFIDENTIAL\" on all pages/screens\n\n#### 3.2.3 Internal Use Information\n\n- **Access**: Available to all employees and authorized contractors\n- **Storage**: On company systems\n- **Transmission**: May be transmitted via internal email\n- **Disposal**: Standard deletion or recycling\n- **Marking**: May be marked \"INTERNAL USE ONLY\" or similar\n\n#### 3.2.4 Public Information\n\n- **Access**: No restrictions\n- **Storage**: No special requirements\n- **Transmission**: No restrictions\n- **Disposal**: Standard disposal\n- **Marking**: No required markings\n\n### 3.3 Classification Responsibilities\n\n- **Information Owners**: Department heads or their designees who are responsible for classifying information assets under their control and ensuring proper protection\n- **Information Custodians**: IT personnel responsible for implementing the technical controls required for each classification level\n- **Information Users**: All employees who handle information and must adhere to the handling requirements for each classification level\n\n### 3.4 Reclassification and Declassification\n\nInformation classification should be reviewed periodically, especially when:\n- The information's sensitivity changes over time\n- Projects move from planning to implementation phases\n- Products move from development to public release\n- Corporate events are announced publicly\n\nReclassification must be approved by the information owner and documented appropriately.\n\n## 4. Compliance\n\nFailure to comply with this policy may result in disciplinary action, up to and including termination of employment or contract. In cases where legal requirements are violated, the organization may be obligated to report the incident to appropriate authorities.\n\n## 5. Related Documents\n\n- Data Protection Policy\n- Information Security Policy\n- Acceptable Use Policy\n- Records Retention Policy\n- Clean Desk Policy\n\n## 6. Policy Review\n\nThis policy will be reviewed annually by the Information Security Officer and updated as necessary to reflect changes in business requirements, technology, or regulatory compliance requirements.\n\n---\n\n**Policy Version**: 2.3  \n**Last Updated**: January 15, 2023  \n**Approved by**: Executive Leadership Team"
      });
      
      await this.addOrganizationPolicy({
        title: "Acceptable Use Policy",
        description: "Guidelines for appropriate use of organizational IT resources and systems.",
        category: "compliance",
        icon: "Laptop",
        content: "# Acceptable Use Policy\n\n## 1. Purpose\n\nThis policy defines the acceptable use of information technology resources and systems within the organization. It aims to protect the organization's data, technology infrastructure, and users from harm caused by inappropriate use.\n\n## 2. Scope\n\nThis policy applies to all employees, contractors, consultants, temporary staff, and other workers at the organization. It covers all equipment, networks, systems, data, and services owned, leased, or provided by the organization, regardless of location.\n\n## 3. Policy\n\n### 3.1 General Use and Ownership\n\n1. Organization-owned equipment and systems are primarily for business purposes. Limited personal use is permitted as long as it does not interfere with job responsibilities or violate any policies.\n\n2. All data created, stored, or transmitted using organization resources remains the property of the organization and may be monitored.\n\n3. Users should have no expectation of privacy when using organization resources.\n\n4. Users are responsible for exercising good judgment regarding appropriate use of organization resources.\n\n5. The organization reserves the right to audit networks and systems to ensure compliance with this policy.\n\n### 3.2 Security and Proprietary Information\n\n1. All users must keep passwords secure and not share accounts. Authorized users are responsible for the security of their passwords and accounts.\n\n2. All devices must be secured with password-protected screen savers with automatic activation set at 10 minutes or less.\n\n3. Employees must encrypt information according to the Information Classification Policy.\n\n4. Users must exercise caution when opening email attachments or clicking on links, particularly from unknown senders.\n\n5. All devices used by the employee that are connected to the organization's networks, whether owned by the employee or the organization, shall continuously run approved anti-virus software with current virus definitions.\n\n### 3.3 Unacceptable Use\n\nThe following activities are generally prohibited. Users may be exempted from these restrictions during the course of their legitimate job responsibilities (e.g., systems administration staff may have a need to disable network access of a host if that host is disrupting production services).\n\nThe following activities are strictly prohibited:\n\n#### 3.3.1 System and Network Activities\n\n1. Violations of the rights of any person or company protected by copyright, trade secret, patent or other intellectual property laws.\n\n2. Unauthorized copying or distribution of copyrighted material including, but not limited to, digitization and distribution of photographs, music, software, or any other copyrighted materials.\n\n3. Introducing malicious programs into the network or server (e.g., viruses, worms, Trojan horses, ransomware).\n\n4. Revealing your account password to others or allowing use of your account by others.\n\n5. Using organization computing resources to actively engage in procuring or transmitting material that is in violation of sexual harassment or hostile workplace laws.\n\n6. Attempting to access any data, system, or user account for which you do not have authorization.\n\n7. Circumventing user authentication or security of any host, network, or account.\n\n8. Using any program/script/command, or sending messages of any kind, with the intent to interfere with, or disable, a user's session.\n\n9. Providing information about employees to unauthorized parties outside the organization.\n\n#### 3.3.2 Email and Communications Activities\n\n1. Sending unsolicited email messages, including \"junk mail\" or other advertising material to individuals who did not specifically request such material.\n\n2. Any form of harassment via email, telephone, or messaging, whether through language, frequency, or size of messages.\n\n3. Forwarding of organizational confidential messages to external locations without authorization.\n\n4. Sending chain letters or joke emails from a organizational email account.\n\n5. Creating or forwarding \"chain letters\" or other \"pyramid\" schemes of any type.\n\n#### 3.3.3 Remote Access\n\n1. Remote access to the organization network must be authorized and strictly controlled.\n\n2. Only approved methods and technologies may be used for remote access.\n\n3. All remote sessions must utilize encryption mechanisms to protect data in transit.\n\n4. Remote access sessions must be disconnected after a period of inactivity not to exceed 30 minutes.\n\n#### 3.3.4 Cloud Services and Applications\n\n1. Only organization-approved cloud services may be used for business data.\n\n2. Users must not bypass IT processes to subscribe to or use cloud services.\n\n3. No sensitive or confidential data may be stored in cloud services without explicit approval from Information Security.\n\n### 3.4 Personal Device Usage (BYOD)\n\nIf personal devices are permitted for work purposes:\n\n1. Only devices meeting minimum security requirements may be used.\n\n2. All devices must be registered with IT before connecting to organization resources.\n\n3. The organization reserves the right to monitor and manage all devices connected to organization resources.\n\n4. Users must report lost or stolen devices immediately.\n\n5. The organization reserves the right to remotely wipe any device containing organization data if deemed necessary.\n\n## 4. Compliance\n\n1. Violations of this policy may result in disciplinary action, up to and including termination of employment or contract.\n\n2. In cases where violation of this policy also constitutes a violation of law, appropriate legal authorities may be notified.\n\n3. Employees who become aware of violations of this policy should notify their manager or the Information Security team.\n\n## 5. Related Documents\n\n- Information Security Policy\n- Information Classification Policy\n- Password Policy\n- Mobile Device Policy\n- Remote Access Policy\n\n## 6. Policy Review\n\nThis policy will be reviewed annually by the Information Security Officer and updated as necessary to reflect changes in business requirements, technology, or regulatory compliance requirements.\n\n---\n\n**Policy Version**: 1.8  \n**Last Updated**: February 12, 2023  \n**Approved by**: Executive Leadership Team"
      });
      
      await this.addOrganizationPolicy({
        title: "Password Security Policy",
        description: "Standards for creating and managing secure passwords and authentication credentials.",
        category: "security",
        icon: "Lock",
        content: "# Password Security Policy\n\n## 1. Purpose\n\nThis policy establishes the standards for creating, managing, and protecting passwords to ensure secure authentication to organization systems and data. Strong password practices are a critical component of the organization's overall information security strategy.\n\n## 2. Scope\n\nThis policy applies to all employees, contractors, consultants, temporary staff, and other workers who access organization systems and data. It covers all passwords used to access organization networks, applications, databases, and services, whether hosted internally or externally.\n\n## 3. Policy\n\n### 3.1 Password Creation Standards\n\n#### 3.1.1 General User Accounts\n\n1. **Minimum Length**: Passwords must be at least 12 characters long.\n\n2. **Complexity**: Passwords must include at least three of the following categories:\n   - Uppercase letters (A-Z)\n   - Lowercase letters (a-z)\n   - Numbers (0-9)\n   - Special characters (!@#$%^&*()-_=+[]{}|;:,.<>?/)\n\n3. **Prohibited Content**: Passwords must NOT contain:\n   - The user's name or username\n   - The organization's name\n   - Common dictionary words\n   - Sequential or repeated characters (e.g., 12345, aaaaa)\n   - Personal information (birthdays, addresses, phone numbers)\n\n4. **Recommended Approach**: Consider using passphrases - longer combinations of unrelated words with numbers and special characters (e.g., \"horse-battery-staple-42!\").\n\n#### 3.1.2 Privileged Accounts (Administrator, System, Service Accounts)\n\n1. **Minimum Length**: Passwords must be at least 16 characters long.\n\n2. **Complexity**: Passwords must include all four character categories.\n\n3. **Generation**: Where possible, passwords should be generated using random password generators rather than manually created.\n\n### 3.2 Password Management\n\n#### 3.2.1 Password Changes\n\n1. **Regular Changes**:\n   - Standard user accounts: Passwords must be changed every 90 days.\n   - Privileged accounts: Passwords must be changed every 60 days.\n   - Service accounts: Passwords must be changed every 180 days.\n\n2. **Forced Changes**: Passwords must be changed immediately if there is any suspicion of compromise.\n\n3. **Password History**: Users cannot reuse any of their previous 8 passwords.\n\n4. **Default Passwords**: All default, vendor-supplied passwords must be changed before any system or software goes into production.\n\n#### 3.2.2 Password Protection\n\n1. **Storage**: Passwords must never be stored in readable form in any location.\n\n2. **Transmission**: Passwords must only be transmitted over encrypted channels.\n\n3. **Sharing**: Passwords must never be shared with anyone, including supervisors and IT staff.\n\n4. **Documentation**: Passwords must never be written down and left in accessible locations.\n\n5. **Password Managers**: Use of organization-approved password managers is encouraged for storing and generating complex passwords.\n\n### 3.3 Authentication Systems\n\n#### 3.3.1 Technical Controls\n\n1. **Encryption**: All passwords must be stored using strong, industry-standard encryption or hashing algorithms.\n\n2. **Failed Attempts**: Accounts will be locked after 5 consecutive failed login attempts for a period of at least 15 minutes, or until an administrator unlocks the account.\n\n3. **Password Entry**: Password entry should be obscured on screen using symbols.\n\n4. **Session Management**: Users should be automatically logged out after 15 minutes of inactivity.\n\n#### 3.3.2 Multi-Factor Authentication (MFA)\n\n1. **Required Use**: MFA is required for:\n   - All remote access to the organization network\n   - All administrator or privileged account access\n   - All access to sensitive data or systems\n\n2. **Approved Methods**: Approved MFA methods include:\n   - Hardware tokens\n   - Software-based authenticator apps\n   - Push notifications to registered mobile devices\n   - Biometrics combined with something you know\n\n3. **Recovery**: Secure processes for MFA recovery must be established and followed.\n\n### 3.4 Application Development\n\n1. Applications developed in-house must adhere to these password security requirements.\n\n2. Applications must not store passwords in clear text or in a recoverable format.\n\n3. Applications should support authentication through the organization's centralized identity management system where possible.\n\n### 3.5 Exceptions\n\n1. Exceptions to this policy may be granted only in exceptional circumstances and must be approved by the Information Security Officer.\n\n2. All exceptions must be documented, include a business justification, and specify a limited timeframe.\n\n3. Compensating controls must be implemented for any approved exceptions.\n\n## 4. Compliance\n\n1. All employees must comply with this policy or face disciplinary action up to and including termination.\n\n2. Regular audits will be conducted to ensure compliance with this policy.\n\n3. Any suspicious activity or suspected policy violations should be reported to the Information Security team immediately.\n\n## 5. Related Documents\n\n- Information Security Policy\n- Acceptable Use Policy\n- Multi-Factor Authentication Procedure\n- Access Control Policy\n- Password Manager Guidelines\n\n## 6. Policy Review\n\nThis policy will be reviewed annually by the Information Security Officer and updated as necessary to reflect changes in business requirements, technology, or regulatory compliance requirements.\n\n---\n\n**Policy Version**: 2.1  \n**Last Updated**: January 5, 2023  \n**Approved by**: Executive Leadership Team"
      });
      
      await this.addOrganizationPolicy({
        title: "Social Engineering Awareness Policy",
        description: "Guidelines for recognizing and preventing social engineering attacks.",
        category: "security",
        icon: "UserCheck",
        content: "# Social Engineering Awareness Policy\n\n## 1. Purpose\n\nThis policy establishes guidelines to help employees recognize, prevent, and respond to social engineering attacks. Social engineering refers to psychological manipulation techniques used to deceive people into making security mistakes or divulging sensitive information. This policy aims to reduce the organization's vulnerability to such attacks.\n\n## 2. Scope\n\nThis policy applies to all employees, contractors, consultants, temporary staff, and other workers who have access to organization systems, information, or facilities. It covers all forms of communication including in-person, telephone, email, messaging, social media, and other electronic communications.\n\n## 3. Policy\n\n### 3.1 Social Engineering Attack Types\n\nEmployees should be aware of common social engineering techniques including but not limited to:\n\n#### 3.1.1 Phishing\n\n- **Email Phishing**: Fraudulent emails that appear to come from legitimate sources requesting sensitive information or containing malicious links/attachments\n- **Spear Phishing**: Targeted phishing attacks customized for specific individuals using personal information\n- **Whaling**: Phishing specifically targeting high-level executives\n- **Smishing**: Phishing conducted via SMS text messages\n- **Vishing**: Voice phishing conducted via phone calls\n\n#### 3.1.2 Pretexting\n\n- Creating a fabricated scenario (pretext) to engage a victim and gain their trust to obtain information or access\n- Often involves impersonating co-workers, police, bank officials, tax authorities, or other trusted individuals\n\n#### 3.1.3 Baiting\n\n- Offering something enticing to the victim in exchange for information or action\n- Can be physical (e.g., infected USB drive left in parking lot) or digital (e.g., free download)\n\n#### 3.1.4 Quid Pro Quo\n\n- Promising a benefit in exchange for information or assistance\n- Common example: caller impersonating IT support offering help in exchange for login credentials\n\n#### 3.1.5 Tailgating/Piggybacking\n\n- Gaining unauthorized physical access by following someone into a restricted area\n- Exploits human courtesy and reluctance to challenge unknown individuals\n\n#### 3.1.6 Water Holing\n\n- Compromising websites frequently visited by the target group\n- Relies on trust in familiar websites\n\n### 3.2 Preventive Measures\n\n#### 3.2.1 Email and Electronic Communications\n\n1. **Verify suspicious requests**: Independently verify unusual requests for sensitive information or financial transactions through a different communication channel.\n\n2. **Check sender details**: Carefully examine the sender's email address for subtle misspellings or domain variations.\n\n3. **Be cautious with links**: Hover over links to preview the URL before clicking. When in doubt, manually navigate to the website instead of clicking links.\n\n4. **Be suspicious of unexpected attachments**: Do not open attachments from unknown sources or unexpected attachments even from known sources.\n\n5. **Beware of urgency**: Be especially cautious of messages creating a sense of urgency, fear, or threat.\n\n#### 3.2.2 Telephone Communications\n\n1. **Verify caller identity**: For requests involving sensitive information or system access, verify the caller's identity by calling them back through official contact numbers.\n\n2. **Be cautious with unsolicited calls**: Be suspicious of unsolicited calls requesting sensitive information or system access.\n\n3. **Don't provide passwords**: Never provide passwords, multi-factor authentication codes, or other credentials over the phone.\n\n4. **Report suspicious calls**: Document and report any suspicious calls to the Information Security team.\n\n#### 3.2.3 Physical Security\n\n1. **Enforce access controls**: Always follow proper badge/access card procedures and never allow tailgating into secured areas.\n\n2. **Challenge unknown individuals**: Politely challenge unfamiliar people in restricted areas if they aren't displaying proper identification.\n\n3. **Secure sensitive information**: Follow clean desk policies and properly dispose of sensitive documents.\n\n4. **Be cautious with physical media**: Never use unknown USB drives or other media found or received unexpectedly.\n\n### 3.3 Incident Response\n\n#### 3.3.1 Reporting Procedures\n\n1. **Immediate reporting**: Report suspected social engineering attacks immediately to the Information Security team and direct manager.\n\n2. **Preservation of evidence**: Preserve all evidence of the suspected attack (emails, messages, notes from conversations).\n\n3. **Incident details**: Document details including time, date, communication method, and information requested or provided.\n\n4. **Non-retaliation**: Employees who report suspicious activities in good faith will not face negative consequences, even if the report turns out to be a false alarm.\n\n#### 3.3.2 Response to Incidents\n\n1. If you suspect you've fallen victim to a social engineering attack:\n   - Report the incident immediately\n   - Change any compromised passwords\n   - Do not have further contact with the suspected attacker\n   - Follow instructions from the Information Security team\n\n2. The Information Security team will:\n   - Investigate the incident\n   - Determine the scope and impact\n   - Implement containment measures\n   - Coordinate remediation efforts\n   - Document lessons learned\n\n### 3.4 Training and Awareness\n\n1. **Mandatory training**: All employees must complete social engineering awareness training as part of onboarding and annual security refresher training.\n\n2. **Simulated attacks**: The organization will conduct periodic simulated social engineering attacks to test awareness and reinforce training.\n\n3. **Awareness campaigns**: Regular communication about current social engineering threats will be provided to all employees.\n\n4. **Updates on threats**: The Information Security team will communicate emerging social engineering techniques and threats as they develop.\n\n## 4. Compliance\n\n1. All employees are expected to comply with this policy.\n\n2. Failure to comply may result in disciplinary action, up to and including termination.\n\n3. Intentionally falling for simulated attacks will not result in disciplinary action but may require additional training.\n\n## 5. Related Documents\n\n- Information Security Policy\n- Acceptable Use Policy\n- Incident Response Policy\n- Email Security Guidelines\n- Physical Security Policy\n\n## 6. Policy Review\n\nThis policy will be reviewed annually by the Information Security Officer and updated as necessary to reflect changes in business requirements, technology, threat landscape, or regulatory compliance requirements.\n\n---\n\n**Policy Version**: 1.5  \n**Last Updated**: March 10, 2023  \n**Approved by**: Executive Leadership Team"
      });
      
      await this.addOrganizationPolicy({
        title: "Mobile Device Security Policy",
        description: "Requirements for securing mobile devices that access organizational data.",
        category: "security",
        icon: "Smartphone",
        content: "# Mobile Device Security Policy\n\n## 1. Purpose\n\nThis policy defines the requirements for using mobile devices to access organization networks and data. It aims to protect the security and integrity of organization data when accessed or stored on mobile devices, whether organization-issued or personally owned.\n\n## 2. Scope\n\nThis policy applies to all employees, contractors, consultants, temporary staff, and other workers using mobile devices to access organization networks, systems, or data. Mobile devices include, but are not limited to, smartphones, tablets, laptops, wearable technology, and other portable computing devices.\n\n## 3. Policy\n\n### 3.1 General Requirements\n\n#### 3.1.1 Acceptable Use\n\n1. Mobile devices used for business purposes must comply with the organization's Acceptable Use Policy.\n\n2. Users must exercise good judgment when using mobile devices in public places to prevent unauthorized viewing of sensitive information.\n\n3. Users must report lost or stolen mobile devices that contain organization data immediately to IT Support and their manager.\n\n4. The organization reserves the right to disconnect mobile devices or disable access to organization resources without notification.\n\n#### 3.1.2 Device Registration and Inventory\n\n1. All mobile devices that will access organization data must be registered with the IT department before access is granted.\n\n2. The IT department will maintain an inventory of all mobile devices accessing organization resources.\n\n3. Device registration will include device type, model, operating system version, owner, and primary user.\n\n### 3.2 Security Requirements\n\n#### 3.2.1 Device Access Controls\n\n1. **Screen Locks**: Mobile devices must be protected using a strong PIN (minimum 6 digits), password, pattern, or biometric authentication.\n\n2. **Automatic Locking**: Devices must automatically lock after a maximum of 5 minutes of inactivity.\n\n3. **Failed Attempts**: Devices must automatically wipe or lock permanently after 10 failed access attempts.\n\n4. **Encryption**: All mobile devices must have full-device encryption enabled.\n\n#### 3.2.2 Operating System and Applications\n\n1. **Updates**: Devices must run current and supported operating systems with automatic updates enabled.\n\n2. **Jailbreaking/Rooting**: Jailbroken or rooted devices are prohibited from accessing organization resources.\n\n3. **Applications**: Applications should only be installed from authorized app stores (Apple App Store, Google Play, or organization's enterprise app store).\n\n4. **Malicious Apps**: Applications that request excessive permissions or have suspicious behavior must be avoided.\n\n#### 3.2.3 Organization Data on Mobile Devices\n\n1. **Data Storage**: Sensitive organization data should not be stored on mobile devices when possible. If required, it must be within organization-approved applications only.\n\n2. **Backups**: Any organization data on mobile devices should be backed up regularly to organization-approved backup systems.\n\n3. **Data Removal**: Users must delete organization data from their devices when it is no longer needed.\n\n4. **Data Segregation**: Organization-approved applications that separate business and personal data are required for accessing organization resources.\n\n### 3.3 Organization-Issued vs. Personal Devices (BYOD)\n\n#### 3.3.1 Organization-Issued Devices\n\n1. **Configuration**: Organization-issued mobile devices will be configured by the IT department according to security standards.\n\n2. **Personal Use**: Limited personal use is permitted on organization-issued devices provided it does not interfere with business use or introduce security risks.\n\n3. **Applications**: The organization reserves the right to restrict application installation on organization-issued devices.\n\n4. **Monitoring**: Organization-issued devices may be monitored for security and compliance purposes.\n\n#### 3.3.2 Personal Devices (BYOD)\n\n1. **Minimum Requirements**: Personal devices must meet minimum security requirements before being allowed to access organization resources.\n\n2. **Mobile Device Management (MDM)**: Users must agree to enroll their personal device in the organization's MDM solution if they wish to access organization data.\n\n3. **Support**: The IT department will provide limited support for personal devices accessing organization resources. Hardware support remains the user's responsibility.\n\n4. **Separation of Data**: Organization data must be contained within approved applications and should not be mixed with personal data.\n\n5. **Privacy Expectations**: Users should understand that while the organization will respect personal privacy, some personal data may be visible to IT administrators through the MDM solution.\n\n### 3.4 Remote Wipe and Device Management\n\n1. **Remote Wipe Authority**: The organization reserves the right to remotely wipe any mobile device containing organization data, which may include personal data on BYOD devices.\n\n2. **Conditions for Remote Wipe**: Remote wipe may be initiated under the following circumstances:\n   - Device is reported lost or stolen\n   - Employee termination\n   - Evidence of security compromise\n   - Violation of organization policies\n   - Detection of malicious software or hacking tools\n\n3. **Selective Wipe**: When possible, only organization data will be removed during a remote wipe of personal devices.\n\n### 3.5 International Travel\n\n1. **Travel Notification**: Users must notify the IT department before traveling internationally with mobile devices containing organization data.\n\n2. **High-Risk Locations**: Additional security measures may be required when traveling to high-risk locations.\n\n3. **Temporary Devices**: For travel to high-risk locations, temporary devices with minimal data may be issued.\n\n4. **Connectivity**: Users should avoid connecting to unsecured wireless networks while traveling internationally.\n\n### 3.6 End of Employment or Device Lifecycle\n\n1. **Device Return**: Organization-issued devices must be returned upon termination of employment or when requested by management.\n\n2. **Data Removal**: All organization data must be removed from personal devices when the user no longer requires access or upon termination of employment.\n\n3. **Exit Process**: The exit process for departing employees will include verification of device return or organization data removal.\n\n## 4. Compliance\n\n1. Compliance with this policy is mandatory for continued access to organization resources via mobile devices.\n\n2. Non-compliance may result in disconnection from organization resources, disciplinary action, or termination of employment.\n\n3. Regular compliance audits will be conducted by the IT department.\n\n## 5. Related Documents\n\n- Information Security Policy\n- Acceptable Use Policy\n- Data Classification Policy\n- Remote Access Policy\n- Incident Response Policy\n\n## 6. Policy Review\n\nThis policy will be reviewed annually by the Information Security Officer and updated as necessary to reflect changes in business requirements, technology, or regulatory compliance requirements.\n\n---\n\n**Policy Version**: 2.0  \n**Last Updated**: February 18, 2023  \n**Approved by**: Executive Leadership Team"
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
  async addTrainingModule(module: InsertTrainingModule): Promise<TrainingModule> {
    const [trainingModule] = await db
      .insert(trainingModules)
      .values(module)
      .returning();
    return trainingModule;
  }
  
  async addThreatScenario(scenario: InsertThreatScenario): Promise<ThreatScenario> {
    const [threatScenario] = await db
      .insert(threatScenarios)
      .values(scenario)
      .returning();
    return threatScenario;
  }
  
  async addOrganizationPolicy(policy: InsertOrganizationPolicy): Promise<OrganizationPolicy> {
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
    let query = db
      .select()
      .from(trainingModules)
      .orderBy(asc(trainingModules.order));
    
    // Safer way to handle the NOT IN clause with array parameters
    if (completedModuleIds.length > 0) {
      const modules = await query;
      const filteredModules = modules.filter(
        module => !completedModuleIds.includes(module.id)
      ).slice(0, limit);
      console.log("Recommended modules (filtered):", filteredModules);
      return filteredModules;
    }
    
    // If no completed modules, just limit the result
    const modules = await query.limit(limit);
    console.log("Recommended modules (all):", modules);
    return modules;
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
  
  async deleteThreatScenario(id: number): Promise<void> {
    await db
      .delete(threatScenarios)
      .where(eq(threatScenarios.id, id));
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