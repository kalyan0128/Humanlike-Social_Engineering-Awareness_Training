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
  addTrainingModule(module: InsertTrainingModule): Promise<TrainingModule>;
  
  // User progress operations
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getCompletedModulesCount(userId: number): Promise<number>;
  
  // Threat scenario operations
  getThreatScenarios(limit?: number): Promise<ThreatScenario[]>;
  getThreatScenario(id: number): Promise<ThreatScenario | undefined>;
  addThreatScenario(scenario: InsertThreatScenario): Promise<ThreatScenario>;
  
  // Organization policy operations
  getOrganizationPolicies(limit?: number): Promise<OrganizationPolicy[]>;
  getOrganizationPolicy(id: number): Promise<OrganizationPolicy | undefined>;
  addOrganizationPolicy(policy: InsertOrganizationPolicy): Promise<OrganizationPolicy>;
  
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
        title: "Social Engineering Fundamentals",
        description: "Understand the basic concepts and psychology behind social engineering attacks",
        content: `# Social Engineering Fundamentals
        
## What is Social Engineering?
Social engineering is the art of manipulating people into performing actions or divulging confidential information. Unlike technical hacking, it relies on human interaction and often involves tricking people into breaking normal security procedures.

## The Psychology Behind Social Engineering
Social engineers exploit key human characteristics:
- Trust: Humans naturally tend to trust
- Fear: We react quickly to threats
- Helpfulness: The desire to assist others
- Respect for authority: Tendency to comply with requests from authority figures

## Quiz Section:
1. What is the primary focus of social engineering attacks?
   a) Exploiting software vulnerabilities
   b) Manipulating people
   c) Network penetration
   d) Password cracking

2. Which human trait do social engineers most commonly exploit?
   a) Intelligence
   b) Technical knowledge
   c) Trust
   d) Physical strength

3. Why are social engineering attacks often more effective than technical attacks?
   a) They're cheaper to execute
   b) The human element is often the weakest link in security
   c) They require less knowledge to perform
   d) They leave no digital evidence

Answers: 1-b, 2-c, 3-b`,
        type: "quiz",
        difficulty: "beginner",
        xpReward: 15,
        order: 1
      },
      {
        title: "Basic Phishing Recognition",
        description: "Learn to identify and avoid common phishing attempts",
        content: `# Basic Phishing Recognition
        
## What is Phishing?
Phishing is a cybercrime where attackers disguise themselves as trustworthy entities to trick victims into revealing sensitive information such as passwords, credit card details, or personal data.

## Common Indicators of Phishing Emails:
- Urgent call to action
- Spelling and grammar errors
- Generic greeting (Dear User, Valued Customer)
- Suspicious or misspelled domain names
- Requests for sensitive information
- Unexpected attachments

## Real-World Example:
An email claiming to be from your bank states there's an "urgent security issue" with your account and you must "verify your information immediately" by clicking a provided link. The email contains subtle spelling errors and the sender's address is slightly different from your bank's actual domain.

## Quiz Section:
1. Which of these is a key indicator of a phishing email?
   a) It comes from someone you know
   b) It has a sense of urgency or threatening language
   c) It has the company's logo
   d) It has links to the company's public website

2. What should you do if you receive a suspicious email from your "bank"?
   a) Reply asking for clarification
   b) Call the bank directly using the number from their official website or your card
   c) Click the link to check if it looks legitimate
   d) Forward it to colleagues to get their opinion

3. Which email address is most likely to be a phishing attempt?
   a) support@mybank.com
   b) customerservice@my-bank.com
   c) help@mybank-secure.net
   d) billing@mybank.customerservice.com

Answers: 1-b, 2-b, 3-d`,
        type: "quiz",
        difficulty: "beginner",
        xpReward: 15,
        order: 2
      },
      {
        title: "Pretexting Defense Strategies",
        description: "Recognize and counter pretexting attacks where attackers create fabricated scenarios",
        content: `# Pretexting Defense Strategies
        
## What is Pretexting?
Pretexting is a form of social engineering where attackers create an invented scenario (the pretext) to engage a victim and get them to divulge information or perform actions.

## Common Pretexting Scenarios:
- Impersonating coworkers, IT staff, or executives
- Posing as vendors, service providers, or contractors
- Claiming to be conducting surveys or research
- Pretending to be new employees who need help

## Defensive Strategies:
- Verify identity through official channels before sharing sensitive information
- Be aware of unusual requests, especially those involving credentials or financial information
- Follow established verification procedures, even when under pressure
- Report suspicious interactions to your security team

## Interactive Scenario:
You receive a call from someone claiming to be from IT support who needs your password to install important updates. They sound professional and mention your department head by name.

## Quiz Section:
1. What is the appropriate response in this scenario?
   a) Provide your password since they know your department head
   b) Ask for their employee ID and call them back on the official IT support line
   c) Give them a temporary password and change it later
   d) Ask them to have your department head contact you directly

2. Which of the following is NOT a legitimate reason for someone to ask for your password?
   a) To help troubleshoot a technical issue
   b) To install software updates
   c) To verify your account
   d) None of these are legitimate reasons to share your password

3. What information should you always verify before engaging with an unexpected caller requesting information?
   a) Their job title and reason for calling
   b) Their knowledge of company structure
   c) Their identity through an independent channel
   d) Their technical expertise

Answers: 1-b, 2-d, 3-c`,
        type: "quiz",
        difficulty: "beginner",
        xpReward: 20,
        order: 3
      },
      {
        title: "Recognizing Social Engineering Red Flags",
        description: "Learn the warning signs of potential social engineering attacks",
        content: `# Recognizing Social Engineering Red Flags
        
## Common Red Flags in Communications:
- Creating urgency or fear ("Act now or your account will be closed")
- Requests for sensitive information like passwords or credit card details
- Offers that seem too good to be true
- Unknown or unexpected attachments
- Links to websites that don't match the official domain
- Messages containing unusual errors or inconsistencies

## Workplace Red Flags:
- Unauthorized or unfamiliar visitors in restricted areas
- People asking detailed questions about internal processes
- Requests that bypass normal security procedures
- Unsolicited packages or USB drives

## Video Demonstration: [Social Engineering Red Flags]
This section would include a video showing examples of red flags in various communications and situations.

## Quiz Section:
1. Which of these is NOT a red flag for social engineering?
   a) An email creating a sense of urgency
   b) A caller who can't provide verifiable credentials
   c) A message requesting information from a source you regularly work with
   d) Unexpected attachments from unknown sources

2. If you notice someone unfamiliar in a restricted area, what should you do?
   a) Assume they have permission to be there
   b) Politely challenge them and/or report to security
   c) Ignore them as it's not your responsibility
   d) Take their photo to report later

3. Why do social engineers often create a sense of urgency in their communications?
   a) To appear more important
   b) To pressure victims into acting without thinking critically
   c) To demonstrate authority
   d) To justify technical errors in their messages

Answers: 1-c, 2-b, 3-b`,
        type: "video",
        difficulty: "beginner",
        xpReward: 20,
        order: 4
      },
      {
        title: "Password Security Best Practices",
        description: "Learn to create strong passwords and manage them securely",
        content: `# Password Security Best Practices
        
## Creating Strong Passwords:
- Use at least 12 characters
- Combine letters, numbers, and symbols
- Avoid easily guessable information (birthdays, names, dictionary words)
- Consider using passphrases instead of single words
- Use different passwords for different accounts

## Safe Password Management:
- Use a reputable password manager
- Enable two-factor authentication whenever available
- Change passwords periodically, especially after potential breaches
- Never share passwords or write them down in unsecured locations

## Password Don'ts:
- Don't use personal information
- Don't use sequential numbers or letters
- Don't reuse passwords across multiple accounts
- Don't share passwords via email or messaging
- Don't use publicly known phrases or lyrics

## Quiz Section:
1. Which of these is the strongest password?
   a) Password123!
   b) July42023
   c) b3st-c0mp@ny-ev3r!
   d) qwerty1234

2. What is the recommended approach for managing multiple passwords?
   a) Use the same password with minor variations
   b) Write them down in a notebook kept at your desk
   c) Use a secure password manager
   d) Use simple passwords you can easily remember

3. How does two-factor authentication improve security?
   a) It makes your password stronger
   b) It requires something you know and something you have
   c) It encrypts your password when transmitted
   d) It changes your password automatically

Answers: 1-c, 2-c, 3-b`,
        type: "quiz",
        difficulty: "beginner",
        xpReward: 15,
        order: 5
      },
      {
        title: "Email Security and Awareness",
        description: "Master techniques to identify and avoid email-based threats",
        content: `# Email Security and Awareness
        
## Common Email-Based Threats:
- Phishing and spear phishing
- Malware distribution via attachments
- Business Email Compromise (BEC)
- Scams and fraud attempts

## Email Security Techniques:
- Verify the sender's email address carefully
- Hover over links before clicking
- Be wary of attachments, especially executable files
- Scrutinize emails requesting financial transactions
- Look for personalization elements that a legitimate sender would include

## Interactive Exercise:
Review sample emails and identify security concerns in each.

## Quiz Section:
1. Your CEO emails you urgently requesting a wire transfer while traveling. What should you do first?
   a) Complete the transfer immediately since it's from the CEO
   b) Verify the request through an alternative communication channel
   c) Forward the email to your coworkers to see if they received it too
   d) Reply asking for more details about the transfer

2. Which file attachment type is most likely to contain malware?
   a) .jpg
   b) .docx
   c) .exe
   d) .pdf

3. In a targeted spear phishing attack, attackers often:
   a) Send the same generic email to thousands of recipients
   b) Use personal information about you gathered from research
   c) Make obvious spelling and grammar mistakes
   d) Ask directly for credit card information

Answers: 1-b, 2-c, 3-b`,
        type: "scenario",
        difficulty: "intermediate",
        xpReward: 25,
        order: 6
      },
      {
        title: "Social Media Safety",
        description: "Protect your personal and professional information on social platforms",
        content: `# Social Media Safety
        
## Social Media Risks:
- Oversharing of personal information
- Exposure to targeted phishing through gathered intel
- Account compromise and impersonation
- Privacy setting confusion or limitations

## Best Practices:
- Regularly review and update privacy settings
- Be selective about connection requests
- Limit personal information shared publicly
- Be careful about revealing your location, travel plans, or daily routines
- Think before posting about your workplace or role

## Professional Considerations:
- Remember that what you post may be visible to employers or colleagues
- Be cautious about discussing workplace specifics
- Consider maintaining separate personal and professional accounts
- Understand your organization's social media policy

## Quiz Section:
1. Which information is generally safest to share publicly on social media?
   a) Your travel plans for the next month
   b) Photos of your workplace access badge
   c) General interests and hobbies
   d) Your complete work history including job responsibilities

2. How can attackers use information from your social media accounts?
   a) To create targeted phishing attempts that appear more legitimate
   b) To answer common security questions (mother's maiden name, first pet, etc.)
   c) To determine when you're away from home
   d) All of the above

3. What should you do if you receive a connection request from someone claiming to be a colleague, but you're unsure?
   a) Accept it to be polite
   b) Verify their identity through company channels before accepting
   c) Ignore it without taking any action
   d) Report it immediately as a fake account

Answers: 1-c, 2-d, 3-b`,
        type: "quiz",
        difficulty: "intermediate",
        xpReward: 20,
        order: 7
      },
      {
        title: "Physical Security Awareness",
        description: "Learn about physical aspects of security that complement cybersecurity",
        content: `# Physical Security Awareness
        
## Physical Security Threats:
- Tailgating into secured areas
- Visual hacking (shoulder surfing)
- Theft of devices or sensitive documents
- Unauthorized access through discarded materials (dumpster diving)

## Preventive Measures:
- Always wear and verify identification badges
- Challenge unfamiliar faces in restricted areas
- Keep sensitive information out of plain view
- Properly dispose of sensitive documents (shredding)
- Use privacy screens when working in public places
- Never leave devices unattended

## Interactive Scenario:
You're working on sensitive documents when someone you don't recognize approaches your desk claiming to be from IT support and needs to check your computer.

## Quiz Section:
1. What is tailgating in physical security terms?
   a) Following too closely while driving
   b) Following an authorized person through a secure entry point
   c) Setting up surveillance equipment
   d) Using someone else's access credentials

2. What should you do when leaving your desk for lunch?
   a) Lock your computer and secure sensitive documents
   b) Ask a nearby colleague to watch your desk
   c) Leave quickly so you don't waste your break time
   d) Turn off your monitor but leave your session active

3. Someone you don't recognize is attempting to enter a secure area behind you. What should you do?
   a) Hold the door open as a courtesy
   b) Allow them to pass if they're wearing any company logo
   c) Direct them to the front desk to get proper access credentials
   d) Ignore the situation as it's not your responsibility

Answers: 1-b, 2-a, 3-c`,
        type: "scenario",
        difficulty: "intermediate",
        xpReward: 25,
        order: 8
      },
      {
        title: "Mobile Device Security",
        description: "Protect sensitive information on smartphones and tablets",
        content: `# Mobile Device Security
        
## Mobile Security Risks:
- Device loss or theft
- Malicious apps and downloads
- Public Wi-Fi vulnerabilities
- Smishing (SMS phishing) attacks
- QR code scams

## Essential Protection Measures:
- Use strong device passwords/biometrics
- Keep devices and apps updated
- Only download apps from official stores
- Enable remote tracking and wiping capabilities
- Use encryption for sensitive data
- Be cautious of app permissions

## Mobile Security While Traveling:
- Limit the data stored on travel devices
- Avoid public charging stations (juice jacking)
- Disable Bluetooth and Wi-Fi when not in use
- Be aware of your surroundings when using devices

## Quiz Section:
1. What is "smishing"?
   a) Using SMS text messages for phishing attacks
   b) Stealing smartphones by physical force
   c) Impersonating mobile service providers by phone
   d) Creating fake mobile apps that look legitimate

2. Why should you be cautious about using public USB charging stations?
   a) They charge your device more slowly
   b) They can transfer malware or steal data while charging
   c) They may overcharge your battery
   d) They are typically more expensive than using your own charger

3. Which of these is the best practice for using Wi-Fi on your mobile device?
   a) Connect to any available free Wi-Fi to save data
   b) Use a VPN when connecting to public Wi-Fi
   c) Share your password-protected hotspot with others who need it
   d) Keep Wi-Fi turned on to automatically connect to known networks

Answers: 1-a, 2-b, 3-b`,
        type: "quiz",
        difficulty: "intermediate",
        xpReward: 20,
        order: 9
      },
      {
        title: "Vishing (Voice Phishing) Prevention",
        description: "Identify and respond to phone-based social engineering attacks",
        content: `# Vishing (Voice Phishing) Prevention
        
## What is Vishing?
Vishing is a social engineering technique using phone calls to trick individuals into revealing personal information, financial details, or credentials.

## Common Vishing Scenarios:
- Callers impersonating technical support
- "Your account has been compromised" scams
- Bank or credit card fraud alerts requiring "verification"
- Government impersonation (IRS, Social Security, etc.)
- Prize or sweepstakes notifications

## Vishing Defense Techniques:
- Be skeptical of unsolicited calls
- Don't provide sensitive information over the phone
- Verify the caller's identity independently
- Use official contact information from statements or websites
- Take time to think before acting on requests

## Interactive Audio Demonstration:
This section would include audio examples of common vishing attempts with analysis.

## Quiz Section:
1. You receive a call claiming to be from your bank about suspicious activity. What should you do?
   a) Provide your information if they can verify the last four digits of your account
   b) Hang up and call the bank directly using the number on your card
   c) Give limited information to help them resolve the issue quickly
   d) Ask them to email you a verification link

2. Which statement about legitimate business calls is true?
   a) They will always ask for your full Social Security number
   b) They usually request immediate action to avoid penalties
   c) They generally don't ask for passwords or security PINs
   d) They typically call from private or unlisted numbers

3. A caller says they're from the IRS and you owe back taxes that must be paid immediately. What is the tell-tale sign this is a scam?
   a) They have your tax ID number
   b) They threaten arrest or legal action if you don't pay immediately
   c) They provide a case reference number
   d) They offer multiple payment options

Answers: 1-b, 2-c, 3-b`,
        type: "video",
        difficulty: "intermediate",
        xpReward: 30,
        order: 10
      },
      {
        title: "USB Drop Attack Awareness",
        description: "Understand the risks of found USB drives and how to protect against them",
        content: `# USB Drop Attack Awareness
        
## What is a USB Drop Attack?
A USB drop attack involves strategically leaving infected USB drives in locations where targets will find and connect them to their computers. These drives may contain malware that automatically executes or social engineering lures.

## The Risks:
- Automatic malware execution through USB autorun features
- Keystroke logging and data theft
- Network access and lateral movement
- Hardware damage (USB killers)

## Protection Measures:
- Never connect unknown USB devices to your computer
- Disable autorun/autoplay features
- Use endpoint protection that scans removable media
- Report found USB devices to IT security
- Follow organizational policies regarding USB devices

## Interactive Scenario:
You find a USB drive in the parking lot with your company's logo on it. What do you do?

## Quiz Section:
1. What is the safest approach if you find an unmarked USB drive in a public area?
   a) Connect it to see who it belongs to
   b) Turn it in to lost and found or IT security without connecting it
   c) Format it before checking the contents
   d) Use a public computer to check its contents

2. Why are USB drop attacks effective despite widespread awareness?
   a) Modern USB drives automatically bypass security controls
   b) Human curiosity and helpfulness often override security concerns
   c) Most malware scanners cannot detect USB-based threats
   d) Companies rarely have policies against using unknown USB devices

3. If you need to use a USB drive at work, you should:
   a) Only use company-issued drives that follow security protocols
   b) Scan any USB drive with antivirus before connecting it
   c) Use personal drives only for non-sensitive information
   d) Format drives after each use

Answers: 1-b, 2-b, 3-a`,
        type: "scenario",
        difficulty: "intermediate",
        xpReward: 25,
        order: 11
      },
      {
        title: "Advanced Phishing Techniques",
        description: "Learn about sophisticated phishing attacks and how to defend against them",
        content: `# Advanced Phishing Techniques
        
## Evolution of Phishing:
- From generic mass emails to highly targeted attacks
- Spear phishing (targeting specific individuals)
- Whaling (targeting executives and high-value individuals)
- Clone phishing (replicating legitimate communications)
- Business Email Compromise (BEC)

## Advanced Indicators:
- Domain spoofing and lookalike domains
- Subtle language inconsistencies
- Contact information discrepancies
- Legitimate-looking document attachments with embedded macros
- Multi-stage attacks that build credibility before the actual attack

## Case Studies:
Analysis of recent high-profile phishing attacks and the techniques used.

## Quiz Section:
1. What distinguishes spear phishing from regular phishing?
   a) Spear phishing uses phone calls instead of emails
   b) Spear phishing is personalized to specific targets using researched information
   c) Spear phishing only targets companies, not individuals
   d) Spear phishing always involves malware attachments

2. In a Business Email Compromise attack, attackers often:
   a) Send mass emails to everyone in a company
   b) Hack email servers directly
   c) Impersonate executives to request wire transfers or sensitive information
   d) Create fake invoices with inflated amounts

3. Which domain is most likely being used in a sophisticated phishing attempt?
   a) paypal.com
   b) paypal-secure.com
   c) paypal.security-check.com
   d) account-verification.paypal.com

Answers: 1-b, 2-c, 3-c`,
        type: "quiz",
        difficulty: "advanced",
        xpReward: 35,
        order: 12
      },
      {
        title: "Social Engineering Through Impersonation",
        description: "Recognize and defend against in-person impersonation tactics",
        content: `# Social Engineering Through Impersonation
        
## Common Impersonation Scenarios:
- IT support or maintenance staff
- New employees needing assistance
- Delivery services and contractors
- Executives or leadership (especially when "in a hurry")
- Cleaning staff or facilities management

## Tactics Used by Impersonators:
- Possession of basic insider information
- Confidence and authoritative behavior
- Creating urgent scenarios to bypass verification
- Using appropriate terminology and industry jargon
- Carrying props like clipboards, tools, or uniforms

## Defense Against Impersonation:
- Always verify identity through approved channels
- Follow visitor management protocols consistently
- Trust your instincts when something feels wrong
- Know your escalation procedures
- Remember that legitimate personnel will understand security procedures

## Interactive Scenario:
Someone in business attire with a temporary badge claims to be a consultant working with your department head. They need access to sensitive data for an urgent project.

## Quiz Section:
1. Which approach is most important when dealing with unscheduled visitors?
   a) Being helpful and accommodating
   b) Consistent identity verification regardless of appearance
   c) Calling security immediately for anyone unfamiliar
   d) Asking to see business cards as proof of identity

2. If someone with apparent authority requests you to bypass security protocols, you should:
   a) Comply if they seem high enough in the organization
   b) Bend the rules slightly but document what you did
   c) Politely refuse and follow established security procedures
   d) Ask them to put their request in writing first

3. Which behavior might indicate a potential impersonator?
   a) Knowing specific company terminology
   b) Having a detailed knowledge of organizational structure
   c) Reluctance to provide credentials or contact information for verification
   d) Being well-dressed and professional

Answers: 1-b, 2-c, 3-c`,
        type: "scenario",
        difficulty: "advanced",
        xpReward: 35,
        order: 13
      },
      {
        title: "Defending Against Social Engineering: Comprehensive Approach",
        description: "Integrate technical, procedural, and human awareness defenses",
        content: `# Defending Against Social Engineering: Comprehensive Approach
        
## Multi-layered Defense Strategy:
- Technical controls (spam filters, anti-malware, access controls)
- Organizational policies and procedures
- Security awareness training and simulations
- Incident response planning
- Regular security assessments

## Building Organizational Resilience:
- Creating a security-conscious culture
- Establishing clear reporting channels for suspicious activities
- Developing and practicing incident response procedures
- Implementing least-privilege access principles
- Supporting employees who question unusual requests

## Advanced Security Controls:
- Multi-factor authentication
- Zero-trust architecture principles
- Data loss prevention systems
- Behavior analytics to detect unusual activities
- Regular penetration testing including social engineering attempts

## Quiz Section:
1. Which best describes the "defense in depth" approach to social engineering?
   a) Training employees to detect attacks with 100% accuracy
   b) Implementing multiple layers of protective measures
   c) Restricting employee access to sensitive systems
   d) Conducting daily security briefings

2. Why is incident response planning important for social engineering defense?
   a) It ensures attacks never succeed
   b) It minimizes damage when preventive measures fail
   c) It places responsibility on the IT department
   d) It satisfies compliance requirements

3. What role should executives play in defending against social engineering?
   a) Be exempt from security policies due to their position
   b) Delegate all security responsibilities to IT
   c) Model good security behavior and support security initiatives
   d) Limit their knowledge of security incidents to avoid liability

Answers: 1-b, 2-b, 3-c`,
        type: "quiz",
        difficulty: "advanced",
        xpReward: 40,
        order: 14
      },
      {
        title: "Social Engineering in Remote Work Environments",
        description: "Understand unique social engineering risks in remote and hybrid work settings",
        content: `# Social Engineering in Remote Work Environments
        
## Unique Remote Work Vulnerabilities:
- Blurred boundaries between work and personal environments
- Reduced face-to-face verification opportunities
- Home network and personal device weaknesses
- Isolation and reduced peer support for security decisions
- Increased reliance on digital communication

## Common Remote Work Attack Scenarios:
- Attacks exploiting collaboration platforms (Zoom, Teams, Slack)
- Home delivery impersonation
- Tech support scams targeting home workers
- Exploitation of insecure home networks
- Attacks leveraging personal devices used for work

## Remote Work Security Best Practices:
- Secure home network configuration
- Proper VPN usage
- Clear guidelines for approved communication channels
- Virtual background usage for video calls
- Physical workspace security considerations

## Quiz Section:
1. When working remotely, which practice best protects against social engineering?
   a) Using personal email for work communications
   b) Establishing clear verification procedures for sensitive requests
   c) Sharing your work calendar publicly
   d) Using the same password for work and personal accounts

2. Which is a legitimate security concern with video conferencing?
   a) Visual background might reveal sensitive personal information
   b) Hackers can use video calls to access your webcam even when not in meetings
   c) All video conferencing platforms are inherently insecure
   d) Using headphones during calls creates security vulnerabilities

3. If you receive a suspicious request from a colleague's messaging account, what should you do first?
   a) Report it to IT security immediately as a compromise
   b) Verify the request through an alternative communication channel
   c) Complete the request if it's urgent
   d) Ask the sender to provide more details over the same channel

Answers: 1-b, 2-a, 3-b`,
        type: "scenario",
        difficulty: "advanced",
        xpReward: 35,
        order: 15
      },
      {
        title: "Emerging Social Engineering Threats and Defenses",
        description: "Stay ahead of evolving social engineering tactics with forward-looking strategies",
        content: `# Emerging Social Engineering Threats and Defenses
        
## Emerging Threat Vectors:
- Deepfake technology in voice and video impersonation
- AI-generated phishing content
- QR code manipulation and fraud
- Cryptocurrency-based scams
- Social media-based intelligence gathering and targeting
- Supply chain social engineering

## Technological Defenses:
- AI-based detection systems
- Behavioral analytics and anomaly detection
- Authentication beyond passwords (biometrics, tokens)
- Automated security awareness tools
- Real-time communication verification

## Forward-Looking Defensive Strategies:
- Continuous adaptive training
- Zero-trust security models
- Security culture development
- Cross-functional security teams
- Developing healthy skepticism while maintaining operational efficiency

## Quiz Section:
1. Which emerging technology poses the greatest voice phishing (vishing) threat?
   a) 5G networks
   b) Voice deepfake technology
   c) Smart speakers
   d) Voice recognition systems

2. Why are QR codes increasingly being used in social engineering attacks?
   a) They're difficult to create
   b) They obfuscate the actual URL destination
   c) They only work on certain devices
   d) They require special software to generate

3. Which best describes the "zero trust" approach to security?
   a) Never trust employees with sensitive information
   b) Verify every access request regardless of source
   c) Block all external communication
   d) Trust but verify

Answers: 1-b, 2-b, 3-b`,
        type: "video",
        difficulty: "advanced",
        xpReward: 45,
        order: 16
      },
      {
        title: "Security Culture Development",
        description: "Learn how to foster a positive security culture in your organization",
        content: `# Security Culture Development
        
## Components of a Strong Security Culture:
- Clear leadership support for security initiatives
- Positive reinforcement rather than punishment
- Regular, engaging security communications
- Security champions within departments
- Celebration of security successes
- Integration of security into business processes

## From Awareness to Culture:
- Moving beyond compliance-focused training
- Developing security as a shared responsibility
- Making security relevant to personal and professional lives
- Creating psychological safety for reporting incidents
- Regular and varied security awareness activities

## Measuring Security Culture:
- Behavioral metrics vs. completion metrics
- Simulated attack response rates
- Security reporting frequency
- Pulse surveys and feedback
- Security incident trends

## Quiz Section:
1. What is a key characteristic of a strong security culture?
   a) Strict penalties for security mistakes
   b) Limiting security knowledge to the IT department
   c) Treating security as everyone's responsibility
   d) Implementing technical controls instead of training

2. How can organizations best encourage reporting of security incidents?
   a) Offering financial rewards for each report
   b) Creating non-punitive reporting systems with positive reinforcement
   c) Implementing anonymous-only reporting
   d) Requiring detailed documentation for all reports

3. Which approach is most effective for security awareness programs?
   a) Annual compliance-focused training
   b) Regular varied activities including simulations, communications, and training
   c) Technical solutions that minimize the need for user education
   d) Detailed security policies distributed to all employees

Answers: 1-c, 2-b, 3-b`,
        type: "quiz",
        difficulty: "advanced",
        xpReward: 40,
        order: 17
      },
      {
        title: "Industry-Specific Social Engineering Threats",
        description: "Learn about unique social engineering threats in different industries",
        content: `# Industry-Specific Social Engineering Threats
        
## Healthcare Sector:
- Protected health information (PHI) targeting
- Impersonation of medical professionals or patients
- Medical emergency pretexts
- Insurance and benefits scams
- COVID-19 and health crisis-related scams

## Financial Services:
- Wire transfer fraud
- Executive whaling attacks
- Customer account takeover attempts
- Investment and cryptocurrency scams
- Regulatory compliance pretexts

## Manufacturing and Critical Infrastructure:
- Intellectual property theft attempts
- Supply chain compromise
- Industrial espionage
- Operational technology sabotage
- International threat actors

## Education and Research:
- Student data targeting
- Research and intellectual property theft
- Financial aid scams
- Campus access and credential theft
- International student targeting

## Quiz Section:
1. In healthcare settings, social engineers often target:
   a) Patient health records
   b) Hospital building blueprints
   c) Cafeteria menus
   d) Public relations documents

2. Financial institutions are particularly vulnerable to:
   a) Attacks requesting emergency wire transfers
   b) Requests for public financial reports
   c) Questions about published interest rates
   d) Inquiries about branch locations

3. Which sector might be targeted by nation-state actors using social engineering?
   a) Small retail businesses
   b) Local restaurants
   c) Research institutions with government contracts
   d) Community recreational facilities

Answers: 1-a, 2-a, 3-c`,
        type: "quiz",
        difficulty: "advanced",
        xpReward: 45,
        order: 18
      },
      {
        title: "Social Engineering Response: Incident Handling",
        description: "Learn proper procedures for responding to suspected social engineering attacks",
        content: `# Social Engineering Response: Incident Handling
        
## Incident Recognition:
- Identifying potential social engineering attempts
- Distinguishing between genuine requests and attacks
- Documentation of suspicious communications
- Preserving evidence appropriately
- Understanding attack indicators

## Response Procedures:
- Immediate actions when suspecting an attack
- Proper reporting channels and escalation
- Communication protocols during incidents
- Containment strategies for different attack types
- Business continuity considerations

## After an Attack:
- Post-incident analysis and learning
- Strengthening defenses based on attack vectors
- Communication to stakeholders
- Legal and regulatory considerations
- Support for affected individuals

## Incident Response Simulation:
Participants work through a simulated social engineering attack scenario, making decisions about appropriate responses at each stage.

## Quiz Section:
1. What should you do first if you believe you've experienced a social engineering attack?
   a) Delete all evidence to prevent further compromise
   b) Report the incident through established channels
   c) Contact the suspected attacker to confirm your suspicions
   d) Reset all your passwords without documenting them

2. Why is documentation important during a social engineering incident?
   a) To assign blame to individuals involved
   b) To fulfill compliance requirements only
   c) To help identify patterns and improve future defenses
   d) To share attack details on social media

3. After a successful social engineering attack, organizations should:
   a) Keep the incident confidential to protect reputation
   b) Conduct analysis to improve defenses and share appropriate lessons
   c) Implement technical controls only
   d) Focus solely on disciplining employees who were deceived

Answers: 1-b, 2-c, 3-b`,
        type: "scenario",
        difficulty: "advanced",
        xpReward: 45,
        order: 19
      },
      {
        title: "Ethical Social Engineering: Security Testing",
        description: "Understand how ethical social engineering is used in security assessments",
        content: `# Ethical Social Engineering: Security Testing
        
## Ethical vs. Malicious Social Engineering:
- Purpose and authorization
- Scope and boundaries
- Documentation and reporting
- Legal and ethical frameworks
- Remediation focus

## Types of Security Assessments:
- Phishing simulations
- Vishing (phone-based) testing
- Physical penetration testing with social elements
- Pretext scenarios and impersonation
- Multi-vector assessment campaigns

## Setting Up Effective Testing:
- Establishing clear rules of engagement
- Executive sponsorship and approval
- Appropriate notification and legal considerations
- Success metrics and measurement
- Constructive feedback mechanisms

## Case Studies:
Examples of successful social engineering assessments and the improvements they enabled.

## Quiz Section:
1. What is the primary purpose of conducting ethical social engineering tests?
   a) To embarrass employees who fail the tests
   b) To satisfy compliance requirements
   c) To identify and address vulnerabilities before real attacks occur
   d) To justify security budget increases

2. Which element must be in place before conducting a social engineering test?
   a) Written authorization from leadership with clear scope
   b) Real employee personal data to make tests realistic
   c) Guarantees that no employees will fail the test
   d) Public announcement of the testing schedule

3. After a social engineering test, what is the most valuable outcome?
   a) Detailed metrics on failure rates by department
   b) Actionable recommendations for improving security posture
   c) List of employees who failed for disciplinary action
   d) Technical reports of systems accessed

Answers: 1-c, 2-a, 3-b`,
        type: "quiz",
        difficulty: "advanced",
        xpReward: 40,
        order: 20
      },
    ];
    
    for (const module of moduleData) {
      await this.addTrainingModule(module);
    }
    
    // Add threat scenarios
    const threatData: InsertThreatScenario[] = [
      {
        title: "Vendor Impersonation Attack",
        description: "Attackers impersonate trusted vendors requesting urgent system access or invoice payments.",
        content: `# Vendor Impersonation Attack

## Scenario Description
A sophisticated attacker has researched your organization and identified one of your main IT vendors. They create emails that appear to come from this vendor, including the correct logo, formatting, and even employee names. The email claims there's an urgent software update that requires immediate access to your systems, or it may contain an invoice that appears slightly different from the usual format.

## Risk Factors
- Established vendor relationships create inherent trust
- Urgency tactics pressure quick decisions
- Familiarity with vendor communications makes anomalies harder to spot
- Financial or access privileges are significant targets

## Real-World Impact
In 2020, a major healthcare organization fell victim to a vendor impersonation attack that resulted in a $4.7 million wire transfer to fraudsters. The attackers had studied the organization's relationship with a medical equipment supplier for months before executing their attack.

## Defense Strategies
1. Implement verification procedures for all vendor requests, especially those involving system access or payments
2. Train employees to recognize subtle differences in communication patterns
3. Establish dedicated channels for vendor payment or access changes
4. Verify all unexpected invoices or access requests through official vendor contact information, not what's provided in the suspicious communication`,
        difficulty: "intermediate",
        isNew: true,
        isTrending: false
      },
      {
        title: "Executive Whaling Attack",
        description: "Sophisticated phishing attacks targeting C-level executives for financial gain or data theft.",
        content: `# Executive Whaling Attack

## Scenario Description
In this advanced attack, cybercriminals meticulously research high-value executives before crafting personalized phishing campaigns. They may monitor an executive's travel schedule, speaking engagements, or social media presence to create extremely convincing scenarios. The goal is typically financial gain (wire transfers, gift cards) or access to sensitive corporate information.

## Risk Factors
- Executives have high-level access privileges
- C-suite members often bypass standard security protocols
- Executive assistants may have authority to act on behalf of busy executives
- High-pressure decisions are common at executive levels

## Real-World Impact
The CEO of a tech company received what appeared to be an email from a board member while traveling internationally. The message referenced their recent discussions accurately and requested an urgent wire transfer to secure a confidential acquisition opportunity. The company lost $3 million before discovering the fraud.

## Defense Strategies
1. Create special security awareness training for executives and their assistants
2. Implement strict verification protocols for financial requests, regardless of source
3. Establish authentication procedures that don't rely solely on email
4. Consider executive privacy protection services to reduce public information availability`,
        difficulty: "advanced",
        isNew: false,
        isTrending: true
      },
      {
        title: "HR Benefits Portal Phishing",
        description: "Attackers exploit HR processes to steal credentials and personal information.",
        content: `# HR Benefits Portal Phishing

## Scenario Description
Employees receive an email that appears to come from the HR department about "important benefits updates" requiring immediate attention. The email directs recipients to a fake portal that mimics the company's actual benefits system. When employees enter their credentials, attackers capture them for unauthorized access to company systems or personal financial accounts.

## Risk Factors
- HR communications are typically trusted
- Benefits information is important to employees
- Personal financial motivations bypass normal security caution
- Timing often coincides with annual enrollment periods

## Real-World Impact
During an annual benefits enrollment period, employees at a financial services company received convincing phishing emails directing them to a fraudulent benefits portal. Over 200 employees entered their corporate credentials, which were then used to access sensitive client financial data.

## Defense Strategies
1. Establish consistent communication channels for HR announcements
2. Implement DMARC and similar email authentication protocols
3. Create clear guidelines on how legitimate HR communications will be delivered
4. Remind employees to access HR portals directly through bookmarked links rather than email links during sensitive periods`,
        difficulty: "intermediate",
        isNew: true,
        isTrending: true
      },
      {
        title: "Remote Work Support Scam",
        description: "Attackers exploit remote work arrangements to gain system access.",
        content: `# Remote Work Support Scam

## Scenario Description
Taking advantage of the rise in remote work, attackers pose as IT support staff offering to help with technical issues or system updates. They may contact employees via phone, email, or messaging platforms, creating urgency around security updates or connectivity problems. Their goal is to gain remote access to systems or harvest credentials.

## Risk Factors
- Physical separation from actual IT staff
- Increased technical issues in remote environments
- Desire to maintain productivity when facing technical problems
- Reduced ability to verify identity through normal means

## Real-World Impact
A remote employee received a call from someone claiming to be from IT support, saying they detected suspicious login attempts on the employee's account. The caller guided the employee to install a "security tool" (actually remote access software) and provide their credentials, resulting in a ransomware infection that spread to the corporate network.

## Defense Strategies
1. Establish clear procedures for how legitimate IT support will contact remote workers
2. Create verification codes or procedures for IT support interactions
3. Implement multi-factor authentication for all remote access
4. Train employees to initiate support requests themselves rather than responding to unsolicited outreach`,
        difficulty: "beginner",
        isNew: true,
        isTrending: true
      },
      {
        title: "QR Code Phishing",
        description: "Attackers use malicious QR codes to direct victims to fraudulent websites.",
        content: `# QR Code Phishing

## Scenario Description
As QR codes become increasingly common for legitimate purposes, attackers leverage them for phishing. They may place malicious QR codes on flyers, advertisements, or even overlay them on legitimate codes. When scanned, these codes direct victims to convincing but fraudulent websites that steal credentials or distribute malware.

## Risk Factors
- QR codes obscure the actual destination URL
- Mobile devices typically show minimal security information
- Users have become accustomed to scanning codes without verification
- Legitimate use cases have normalized QR code usage

## Real-World Impact
A company's employees received an email about a new parking validation system using QR codes. The codes, when scanned, led to a site requesting corporate credentials to "register" for parking. Several employees provided their credentials before the security team identified the attack.

## Defense Strategies
1. Train users to inspect QR code destinations before providing any information
2. Use QR code scanner apps with security features that preview URLs
3. Be suspicious of unexpected QR codes, especially those promising rewards or requiring immediate action
4. Implement phishing-resistant authentication methods across company resources`,
        difficulty: "beginner",
        isNew: true,
        isTrending: false
      },
      {
        title: "Cloud Storage Share Phishing",
        description: "Attackers exploit familiarity with cloud storage notifications to distribute malware.",
        content: `# Cloud Storage Share Phishing

## Scenario Description
Victims receive what appears to be a standard notification from services like Google Drive, OneDrive, or Dropbox, indicating someone has shared a document with them. The notification and subsequent login page look identical to legitimate services, but when the victim attempts to access the document, they either download malware or provide their credentials to a fake login page.

## Risk Factors
- Cloud sharing notifications are common in business environments
- Users are conditioned to trust and act on these notifications
- Legitimate sharing services typically require authentication
- Professional environments often require viewing shared documents

## Real-World Impact
A marketing team received what appeared to be a Google Drive link to a competitive analysis report from an "industry consultant." When team members clicked the link and authenticated, their accounts were compromised, and the attacker used their email accounts to distribute malware throughout the organization.

## Defense Strategies
1. Verify unexpected shares through alternative communication channels
2. Check email sender addresses carefully, even when the formatting looks familiar
3. Be cautious of unusual or unexpected shared documents
4. Access cloud services directly rather than through email links when possible`,
        difficulty: "intermediate",
        isNew: false,
        isTrending: true
      },
      {
        title: "Voice Deepfake Financial Fraud",
        description: "Attackers use AI-generated voice deepfakes to impersonate executives for financial gain.",
        content: `# Voice Deepfake Financial Fraud

## Scenario Description
Using advanced AI technology, attackers create convincing voice recreations of executives or authorized financial personnel. They call employees with financial authority, creating urgency around a confidential transaction that must be completed immediately. The familiar voice and contextual knowledge make the request seem legitimate.

## Risk Factors
- Voice is traditionally considered a strong identifier
- AI technology makes voice synthesis increasingly realistic
- Executives often make urgent, confidential financial requests
- Standard verification procedures may be bypassed for leadership

## Real-World Impact
In 2019, criminals used AI-generated voice deepfake technology to impersonate a CEO's voice, calling a financial officer and requesting an urgent transfer of €220,000 ($243,000) for a supposed acquisition. The transfer was made before the fraud was discovered.

## Defense Strategies
1. Implement multi-factor, multi-channel verification for all financial transactions
2. Establish code words or verification questions that aren't publicly available
3. Create clear financial approval chains that require multiple approvals
4. Train finance staff to be suspicious of urgent, unusual, or confidential transaction requests`,
        difficulty: "advanced",
        isNew: true,
        isTrending: true
      },
      {
        title: "Supply Chain Compromise",
        description: "Attackers target weaker security in your supply chain to gain access to your organization.",
        content: `# Supply Chain Compromise

## Scenario Description
Rather than attacking your organization directly, threat actors compromise a vendor, supplier, or service provider in your supply chain. From this trusted position, they can introduce malware into software updates, compromise hardware during manufacturing, or use legitimate access channels to infiltrate your systems.

## Risk Factors
- Supply chains involve numerous entities with varying security standards
- Vendor access often bypasses normal security controls
- Software updates from trusted sources are rarely questioned
- Complex supply chains make security oversight difficult

## Real-World Impact
The 2020 SolarWinds attack is a prime example, where attackers compromised the company's software build system, inserting malicious code into legitimate software updates. These updates were then distributed to approximately 18,000 customers, including government agencies and major corporations.

## Defense Strategies
1. Conduct security assessments of critical vendors
2. Implement zero-trust principles even for trusted supply chain partners
3. Monitor vendor access and activities within your systems
4. Create security standards for your supply chain partners
5. Verify software updates before deployment to production systems`,
        difficulty: "advanced",
        isNew: false,
        isTrending: true
      },
      {
        title: "Job Opportunity Malware",
        description: "Attackers target job seekers with malicious attachments disguised as job applications.",
        content: `# Job Opportunity Malware

## Scenario Description
Attackers create fake job listings or send unsolicited "headhunter" emails with malicious attachments disguised as job descriptions, application forms, or company information. When opened, these attachments install malware that can steal credentials, encrypt files, or provide remote access to attackers.

## Risk Factors
- Career advancement is a strong motivator
- Job application documents are commonly exchanged
- Document attachments are expected in hiring processes
- Financial opportunity can override security caution

## Real-World Impact
A cybersecurity firm documented a campaign targeting professionals on LinkedIn with fake job opportunities. When victims opened the attached "job description" Word documents, they executed macros that installed remote access trojans, giving attackers complete control over their systems.

## Defense Strategies
1. Verify job opportunities through official company websites
2. Be suspicious of unsolicited job offers, especially for positions you didn't apply for
3. Open attachments only after verifying the sender's identity
4. Use a secure environment to review unsolicited documents from unknown sources`,
        difficulty: "beginner",
        isNew: false,
        isTrending: false
      },
      {
        title: "Social Media Impersonation",
        description: "Attackers create fake social media profiles of executives to manipulate employees or customers.",
        content: `# Social Media Impersonation

## Scenario Description
Attackers create convincing social media profiles impersonating company executives or employees. These profiles may connect with real employees, partners, or customers to build credibility. The fake accounts then exploit these relationships to gather information, spread misinformation, or direct victims to phishing sites.

## Risk Factors
- Social media verification is often minimal
- Professional networking is encouraged in many companies
- Publicly available information makes impersonation easier
- Connecting with leadership is seen as good career management

## Real-World Impact
A financial services company discovered fake LinkedIn profiles of their C-suite executives connecting with employees. These profiles sent messages with links to "confidential strategic plans" that actually led to credential-harvesting sites, compromising several manager-level accounts.

## Defense Strategies
1. Maintain an official registry of executive social media accounts
2. Educate employees about verification steps before connecting with purported colleagues
3. Implement processes to regularly search for and report impersonation accounts
4. Establish clear guidelines for what type of information may be shared via social media
5. Verify unusual requests through official channels, regardless of apparent source`,
        difficulty: "intermediate",
        isNew: false,
        isTrending: false
      },
      {
        title: "Conference & Event Exploitation",
        description: "Attackers target industry conferences and events to compromise attendees.",
        content: `# Conference & Event Exploitation

## Scenario Description
Cybercriminals target professional conferences and events, creating fake registration pages, distributing malicious event apps, setting up rogue WiFi networks, or conducting physical social engineering while on-site. These tactics exploit the natural networking and information-sharing environment of professional gatherings.

## Risk Factors
- Professional events involve numerous unknown individuals
- Attendees expect to receive communications about the event
- Conference WiFi networks are widely used without verification
- Business cards and contact information are freely exchanged

## Real-World Impact
At a major technology conference, attackers set up a rogue WiFi network named similarly to the official network. Attendees who connected had their traffic intercepted, resulting in credential theft and the installation of monitoring software on their devices.

## Defense Strategies
1. Verify conference communications through official websites
2. Use VPNs when connecting to public or conference WiFi
3. Be cautious about downloading event-specific apps
4. Verify the identity of individuals before sharing sensitive information
5. Disable Bluetooth and WiFi when not in use at large events`,
        difficulty: "intermediate",
        isNew: false,
        isTrending: false
      },
      {
        title: "Cryptocurrency Investment Scam",
        description: "Attackers exploit interest in cryptocurrency to conduct elaborate investment frauds.",
        content: `# Cryptocurrency Investment Scam

## Scenario Description
Victims are targeted with promises of extraordinary returns through cryptocurrency investments. These schemes often feature fake investment platforms with sophisticated interfaces showing fake "gains" to encourage larger investments. When victims try to withdraw funds, they discover the entire operation was fraudulent.

## Risk Factors
- Complex technology makes verification difficult
- Fear of missing financial opportunities
- Legitimate cryptocurrency investments have shown high returns
- Regulatory oversight is still developing in this space

## Real-World Impact
In 2021, a fake cryptocurrency exchange defrauded investors of over $120 million through a combination of social media promotion, fake testimonials, and a sophisticated trading interface that displayed fictional gains on investments.

## Defense Strategies
1. Research investment opportunities thoroughly before committing funds
2. Verify the legitimacy of cryptocurrency platforms through independent sources
3. Be skeptical of guaranteed returns or pressure to invest quickly
4. Use only well-established cryptocurrency exchanges with proven security records
5. Start with small investments to test withdrawal processes`,
        difficulty: "beginner",
        isNew: true,
        isTrending: true
      },
      {
        title: "Juice Jacking Attack",
        description: "Attackers compromise public charging stations to access mobile devices.",
        content: `# Juice Jacking Attack

## Scenario Description
This attack exploits public USB charging stations in airports, hotels, and conference centers. Modified charging ports or cables are used to establish data connections with connected devices, allowing attackers to extract data or install malware while the device charges.

## Risk Factors
- People often need to charge devices while traveling
- USB connections allow both power and data transfer
- Low battery anxiety can override security concerns
- Public charging stations are increasingly common

## Real-World Impact
At several international airports, investigators discovered compromised charging stations that were copying photos, contact lists, and account information from connected devices. Some advanced stations installed monitoring software that continued to extract data long after the device was disconnected.

## Defense Strategies
1. Use AC wall outlets rather than USB ports when possible
2. Carry portable battery packs for emergency charging
3. Use "USB condoms" or data-blocking adapters that prevent data transfer
4. Power off devices completely before connecting to unknown charging ports
5. Consider carrying your own charging cables and adapters`,
        difficulty: "beginner",
        isNew: false,
        isTrending: false
      },
      {
        title: "Tech Support Scam",
        description: "Attackers pose as technical support to gain system access or payments.",
        content: `# Tech Support Scam

## Scenario Description
Victims receive unsolicited calls, pop-up messages, or emails claiming to be from tech support services (often impersonating Microsoft, Apple, or other known companies). They claim to have detected viruses or problems with the victim's computer and offer to fix them remotely - either installing malware during "repair" or charging for unnecessary services.

## Risk Factors
- Technical problems are common and frustrating
- Most users lack advanced technical knowledge
- Legitimate remote support services exist
- Brand impersonation lends credibility

## Real-World Impact
An elderly user received a convincing "warning" pop-up while browsing, claiming their Microsoft Windows was infected. The provided support number connected them to scammers who gained remote access to their computer, "demonstrated" fake problems, and charged $499 for unnecessary "lifetime protection services" while installing monitoring software.

## Defense Strategies
1. Remember that legitimate tech companies don't send unsolicited messages or make unsolicited calls
2. Never give remote access to someone who contacts you unexpectedly
3. Ignore pop-up messages with support numbers
4. Contact tech support directly through official websites or product documentation
5. Be suspicious of support requiring payment via gift cards or wire transfers`,
        difficulty: "beginner",
        isNew: false,
        isTrending: false
      },
      {
        title: "Hotel Booking Scam",
        description: "Attackers create fake hotel booking sites or intercept legitimate reservations.",
        content: `# Hotel Booking Scam

## Scenario Description
Business travelers are targeted with fake booking confirmations, cancellation notices, or special offers appearing to come from hotels where they have reservations. These communications direct victims to fraudulent payment sites or request credit card information to "confirm" their booking, resulting in financial theft.

## Risk Factors
- Business travel often involves unfamiliar hotels and locations
- Multiple legitimate communications are expected during booking processes
- Travel arrangements are time-sensitive
- Hotel confirmations commonly require credit card information

## Real-World Impact
Several executives traveling to an industry conference received emails claiming their hotel reservations needed to be confirmed due to a system update. The email directed them to a convincing but fraudulent site that collected their credit card details and personal information.

## Defense Strategies
1. Verify changes to travel arrangements by calling hotels directly using numbers from official websites
2. Be suspicious of unexpected booking changes, especially those requiring immediate action
3. Book travel through established corporate travel programs or reputable agencies
4. Check URLs carefully before entering payment information
5. Use credit cards with strong fraud protection for travel expenses`,
        difficulty: "beginner",
        isNew: false,
        isTrending: false
      },
      {
        title: "Fake Shipping Notification Attack",
        description: "Attackers exploit online shopping habits with fake delivery notifications.",
        content: `# Fake Shipping Notification Attack

## Scenario Description
Victims receive emails or text messages that appear to be from legitimate delivery services (UPS, FedEx, DHL, etc.) claiming there's a problem with a delivery. The message contains a link to "update delivery preferences" or "track a package" that leads to a credential-harvesting site or prompts malware downloads.

## Risk Factors
- Online shopping has become extremely common
- People regularly receive legitimate shipping notifications
- Delivery problems do occur and require customer action
- The convenience of clicking tracking links is habit-forming

## Real-World Impact
During the holiday shopping season, a campaign of fake DHL delivery notification emails reached millions of consumers. The emails claimed packages couldn't be delivered due to "address problems" and directed recipients to a convincing but fraudulent site that harvested login credentials for multiple platforms.

## Defense Strategies
1. Access delivery services directly through official apps or websites
2. Check sender email addresses carefully for slight misspellings
3. Be suspicious if you're not expecting a delivery
4. Track shipments using order numbers from your purchase confirmations
5. Don't download attachments from shipping notifications`,
        difficulty: "beginner",
        isNew: false,
        isTrending: false
      },
      {
        title: "Fake Job Interview Request",
        description: "Attackers pose as recruiters to steal personal information or conduct fraud.",
        content: `# Fake Job Interview Request

## Scenario Description
Professionals receive personalized emails or LinkedIn messages from supposed recruiters inviting them to interview for attractive positions. The process seems legitimate until candidates are asked to provide sensitive personal information, pay for "background checks," or install specialized "interview software" that contains malware.

## Risk Factors
- Career advancement is a powerful motivator
- Legitimate recruiters do make unsolicited contact
- Job application processes require personal information
- Video interviews and specialized platforms are common

## Real-World Impact
A technology professional received a convincing interview request for a high-paying remote position. After initial phone interviews, they were asked to install "proprietary interview software" for a technical assessment. The software was actually a remote access trojan that gave attackers access to their current employer's systems.

## Defense Strategies
1. Research companies and recruiters thoroughly before engaging
2. Be suspicious of unusually attractive offers or expedited hiring processes
3. Never pay money upfront for any part of a legitimate job application
4. Verify job opportunities through company career pages
5. Use caution when installing unknown software for interview processes`,
        difficulty: "intermediate",
        isNew: true,
        isTrending: false
      },
      {
        title: "Pretexting for Information Gathering",
        description: "Attackers use elaborate scenarios to trick employees into revealing information.",
        content: `# Pretexting for Information Gathering

## Scenario Description
An attacker creates a fictional scenario (pretext) and assumes a role relevant to that scenario to manipulate victims into providing information or access. For example, they might pose as a new employee needing help, an IT auditor conducting a security assessment, or a researcher collecting industry data.

## Risk Factors
- Employees want to be helpful to colleagues and partners
- Organizational knowledge may be distributed across teams
- Busy professionals may not take time to verify identities
- Impersonating insiders or authority figures is effective

## Real-World Impact
A social engineer posing as an external auditor contacted various departments within a company, gathering bits of seemingly innocent information. By combining these pieces from different sources, they assembled enough knowledge to successfully impersonate an executive and authorize a fraudulent wire transfer.

## Defense Strategies
1. Verify the identity of unknown individuals before providing information
2. Have clear policies about what information can be shared and with whom
3. Establish verification procedures for common scenarios (new employees, audits, etc.)
4. Create a culture where verification is respected, not seen as unhelpful
5. Train employees to recognize information-gathering techniques`,
        difficulty: "advanced",
        isNew: false,
        isTrending: false
      },
      {
        title: "Deepfake Video Conference Scam",
        description: "Attackers use AI-generated deepfakes during video calls to impersonate executives.",
        content: `# Deepfake Video Conference Scam

## Scenario Description
In this cutting-edge attack, criminals use artificial intelligence to create convincing deepfake videos of executives or trusted figures during live video conferences. These sophisticated impersonations can be used to direct employees to transfer funds, share sensitive information, or provide system access.

## Risk Factors
- Video verification has traditionally been considered highly reliable
- Remote work has normalized video conference communications
- AI technology for real-time deepfakes is rapidly advancing
- Executives may have extensive video footage available for training AI models

## Real-World Impact
In a 2022 case, financial employees joined a video call they believed was with their CFO (based on an invitation from his apparently compromised email). The "CFO" on video directed an urgent wire transfer for a confidential acquisition. The deepfake was convincing enough that $35 million was transferred before the fraud was discovered.

## Defense Strategies
1. Implement multi-factor, multi-channel verification for significant requests
2. Establish pre-arranged verification questions or signals with key executives
3. Be suspicious of unexpected video calls, especially those with unusual requests
4. Develop and enforce financial approval processes that cannot be circumvented
5. Train employees on the existence and risks of deepfake technology`,
        difficulty: "advanced",
        isNew: true,
        isTrending: true
      },
      {
        title: "Watering Hole Attack",
        description: "Attackers compromise websites frequently visited by their targeted victims.",
        content: `# Watering Hole Attack

## Scenario Description
Rather than directly targeting victims, attackers identify and compromise websites regularly visited by their intended targets (industry-specific resources, local news, professional associations). When victims visit these legitimate but compromised sites, they are served malware specifically designed for the target organization.

## Risk Factors
- Trusted websites receive less scrutiny from users
- Industry-specific sites may have weaker security but highly valuable visitors
- Targeted malware can be designed to evade specific security measures
- Legitimate business research requires visiting various websites

## Real-World Impact
A nation-state threat actor compromised multiple websites serving a specific industrial sector. When employees from targeted companies visited these industry resources, they unknowingly downloaded malware that specifically targeted industrial control systems, resulting in operational disruptions.

## Defense Strategies
1. Implement robust endpoint protection and browser isolation technologies
2. Keep all systems and applications fully patched and updated
3. Use network monitoring to detect unusual connections or data transfers
4. Employ strict web filtering and reputation services
5. Consider advanced threat protection solutions that analyze website behavior`,
        difficulty: "advanced",
        isNew: false,
        isTrending: false
      },
      {
        title: "Social Media Quiz Data Harvesting",
        description: "Seemingly innocent social media quizzes designed to collect personal information.",
        content: `# Social Media Quiz Data Harvesting

## Scenario Description
Fun social media quizzes (Which character are you? What's your career destiny? What does your name mean?) appear harmless but are designed to collect personal information that can be used for password cracking, security question answers, or targeted phishing attacks.

## Risk Factors
- Quizzes are entertaining and highly shareable
- Questions often align with common security questions
- Social pressure encourages participation
- Privacy implications aren't obvious to participants

## Real-World Impact
A popular "Your Career History" quiz asked users to combine their first pet's name, the street they grew up on, and their first job—effectively collecting answers to common account recovery questions. This data was later used in targeted account takeover attempts.

## Defense Strategies
1. Be suspicious of quizzes asking for personal information
2. Never share information that resembles password reset or security questions
3. Review privacy settings on social media platforms regularly
4. Consider using false information for actual security questions
5. Be selective about which third-party applications you grant access to your social media accounts`,
        difficulty: "beginner",
        isNew: false,
        isTrending: true
      },
      {
        title: "Rogue QR Code Payment Scam",
        description: "Attackers replace legitimate payment QR codes with fraudulent ones.",
        content: `# Rogue QR Code Payment Scam

## Scenario Description
As QR code payments become more common in restaurants and retail environments, attackers place their own fraudulent QR codes over legitimate ones. When customers scan these codes to pay, they are directed to convincing but fake payment sites that steal credit card information or initiate payments to attacker-controlled accounts.

## Risk Factors
- QR code contents cannot be determined visually
- Payment QR codes in public places are accessible to tampering
- Customers expect to be directed to payment sites after scanning
- Small visual differences in QR codes won't be noticeable

## Real-World Impact
A restaurant chain discovered that attackers had placed overlay stickers with modified QR codes on their table payment instructions. Hundreds of customers had scanned these codes and submitted payment details to fraudulent sites before the compromise was detected.

## Defense Strategies
1. Verify that QR codes haven't been tampered with (check for stickers or overlays)
2. Examine the URL carefully before entering payment information
3. Use only official payment apps rather than scanning to web-based payment forms
4. Check that payment pages use HTTPS and match the expected business domain
5. Consider using alternative payment methods when available`,
        difficulty: "intermediate",
        isNew: true,
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
        content: `# Data Classification Policy

## Purpose
This policy establishes the framework for classifying organizational data based on its sensitivity and criticality, ensuring appropriate handling, protection, and compliance with regulations.

## Scope
This policy applies to all data created, received, maintained, or transmitted by any member of the organization, regardless of format or location.

## Data Classification Categories

### Public Data
- Definition: Information that can be freely disclosed to the public
- Examples: Marketing materials, public financial reports, job postings
- Handling: No restrictions on distribution or access

### Internal Data
- Definition: Non-sensitive information meant for internal use only
- Examples: Internal phone directories, organizational charts, non-sensitive policies
- Handling: May be shared within the organization but not externally without approval

### Confidential Data
- Definition: Sensitive information that requires protection from unauthorized access
- Examples: Strategic plans, product development information, contractual agreements
- Handling: Access on a need-to-know basis, encryption when stored or transmitted, no sharing without authorization

### Restricted Data
- Definition: Highly sensitive information that would cause significant harm if compromised
- Examples: Customer PII, payment card information, health information, authentication credentials
- Handling: Strict access controls, encryption both at rest and in transit, comprehensive audit trails

## Handling Requirements by Classification

[Table detailing specific handling requirements for each data classification]

## Responsibilities
- All employees: Properly identify and handle data according to its classification
- Data owners: Assign proper classification to data under their purview
- IT Department: Implement technical controls to enforce policy
- Security Team: Monitor compliance and investigate violations

## Policy Violations
Violations may result in disciplinary action up to and including termination of employment or contract.`,
        category: "data-security"
      },
      {
        title: "Email Security Guidelines",
        description: "Procedures for secure email communication",
        content: `# Email Security Guidelines

## Purpose
These guidelines establish requirements for the proper use of organizational email systems to protect against unauthorized access, data leakage, and social engineering attacks.

## Acceptable Use
- Company email accounts should be used primarily for business purposes
- Limited personal use is permitted provided it doesn't interfere with work responsibilities
- Email should never be used for illegal activities, harassment, or sending inappropriate content
- Company confidential information should only be shared with authorized recipients

## Security Practices
- Create strong, unique passwords for email accounts
- Enable multi-factor authentication when available
- Log out of email when using shared or public computers
- Report suspicious emails to the IT Security team
- Do not open attachments or click links from unknown or unexpected sources
- Verify the identity of the sender before responding to requests for sensitive information

## Handling Sensitive Information
- Encrypt emails containing sensitive or restricted information
- Verify recipient email addresses before sending sensitive content
- Consider using secure file sharing alternatives for highly sensitive documents
- Include confidentiality notices in external communications
- Do not forward internal communications to external parties without authorization

## Phishing Awareness
- Be suspicious of unexpected emails, especially those creating urgency
- Verify unusual requests from colleagues or executives through a secondary channel
- Hover over links to verify destination URLs before clicking
- Be wary of grammar errors, generic greetings, or unusual requests
- Report suspected phishing attempts immediately

## Email Retention
- Business records communicated via email must be retained according to the Data Retention Policy
- Emails should be organized into appropriate folders for efficient retrieval
- Delete unnecessary emails regularly to maintain storage quotas

## Remote Access
- Use secure connections (VPN) when accessing email from public networks
- Avoid configuring automatic email forwarding to personal accounts
- Report lost or stolen devices with email access immediately`,
        category: "communication"
      },
      {
        title: "Incident Reporting Protocol",
        description: "Steps to report security incidents",
        content: `# Incident Reporting Protocol

## Purpose
This protocol establishes a structured process for reporting security incidents to ensure timely response, appropriate escalation, and consistent handling across the organization.

## What to Report
Security incidents that should be reported include but are not limited to:
- Suspected or confirmed data breaches
- Unauthorized access to systems or facilities
- Phishing or social engineering attempts
- Lost or stolen devices containing company data
- Malware infections or suspicious system behavior
- Physical security violations
- Policy violations with security implications

## Reporting Process

### Step 1: Initial Detection and Containment
- If possible, take immediate actions to contain the incident
- Document what you've observed, including timestamps and affected systems
- Do not discuss the incident with unauthorized personnel
- Preserve evidence where possible

### Step 2: Notification
- Report the incident to the Security Incident Response Team:
  - During business hours: Call the Security Hotline at x1234
  - After hours: Call the 24/7 Emergency Response Line at (555) 123-4567
  - Email: security.incidents@company.com (only if phone reporting is not possible)
- Required information:
  - Your name and contact information
  - Nature of the incident
  - Systems, data, or facilities involved
  - When the incident was discovered
  - Actions already taken

### Step 3: Documentation
- Complete the Incident Reporting Form within 24 hours
- Include all relevant details and observations
- Submit the form to your manager and the Security Team

## Escalation Procedures
- Critical incidents (data breaches, widespread malware) will be escalated to senior management immediately
- Regulatory reporting requirements will be assessed by the Legal and Compliance team
- External communication will be coordinated through Corporate Communications

## Non-Retaliation Policy
Employees who report security incidents in good faith will not face retaliation, even if the incident resulted from an error on their part.

## Training and Awareness
All employees will receive annual training on how to recognize and report security incidents.`,
        category: "incident-response"
      },
      {
        title: "Acceptable Use Policy",
        description: "Guidelines for appropriate use of organizational IT resources",
        content: `# Acceptable Use Policy

## Purpose
This policy defines the acceptable use of computing resources, networks, and data to protect the organization and its assets from risks including but not limited to unauthorized access, disclosure, modification, and destruction.

## Scope
This policy applies to all employees, contractors, consultants, temporary staff, and other workers at the organization, including all personnel affiliated with third parties who access organizational network resources.

## General Use Guidelines
- Organizational resources are provided primarily for business purposes
- Limited personal use is permitted if it doesn't interfere with job performance
- Users are responsible for exercising good judgment regarding appropriate use
- All resources may be monitored in accordance with applicable laws
- No expectation of privacy exists when using organizational resources

## Prohibited Activities
- Violations of law, or any activities that could adversely affect the organization
- Unauthorized access, alteration, destruction, removal, or disclosure of data
- Sharing of access credentials with others
- Installing unauthorized software or hardware
- Circumventing security controls
- Using resources for commercial ventures, religious or political causes, or outside organizations
- Creating or forwarding chain letters, Ponzi, or other pyramid schemes
- Engaging in any form of harassment via electronic means

## Password and Authentication
- Create strong, unique passwords for all accounts
- Passwords must not be shared, written down, or stored insecurely
- Multi-factor authentication must be used where available
- Lock or log off systems when unattended

## Email and Communication
- Exercise caution when opening attachments or clicking links
- Do not use email for sensitive or confidential information without encryption
- Professional standards of communication apply to all electronic messages
- Business records communicated electronically must be retained appropriately

## Software Licensing
- Only legally licensed software may be installed on organizational systems
- Users must not duplicate licensed software
- All software must be approved by IT before installation

## Compliance
Violations of this policy may result in disciplinary action, up to and including termination of employment or contract. The organization reserves the right to notify appropriate law enforcement agencies of illegal activities.`,
        category: "usage-policy"
      },
      {
        title: "Password Management Policy",
        description: "Requirements for creating and managing secure passwords",
        content: `# Password Management Policy

## Purpose
This policy establishes standards for creating strong passwords, protecting passwords, and frequency of password changes to reduce the risk of compromise of password-based authentication systems.

## Password Creation Requirements
- Minimum length: 12 characters
- Complexity: Must include at least three of the following:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters
- Prohibited content:
  - Dictionary words
  - Sequential or repeated characters (e.g., 12345, aaa)
  - Personal information (names, birth dates)
  - Corporate information (company name, address)
  - Passwords used on other systems

## Password Protection
- Passwords must not be shared with anyone, including IT staff
- Passwords should not be written down or stored electronically without encryption
- Do not use "Remember Password" features in applications or browsers
- Use a password manager approved by the IT department
- Do not reveal passwords over the phone, in emails, or through other communication channels
- If you suspect a password has been compromised, report it immediately and change all similar passwords

## Password Change Requirements
- Standard user accounts: Every 90 days
- Privileged accounts (admin/system): Every 60 days
- Service accounts: Every 180 days
- New passwords cannot match any of the previous 12 passwords

## Multi-Factor Authentication
- MFA is required for:
  - Remote access to the network
  - Access to sensitive systems or data
  - Administrator/privileged accounts
  - Cloud applications containing organizational data

## Application Development Standards
- Applications must support authentication that meets or exceeds this policy
- Passwords must be stored using strong, industry-standard cryptographic hashing algorithms
- Transmission of passwords must occur over encrypted channels

## Exceptions
Exceptions to this policy may be granted only by the Chief Information Security Officer and must be documented with a business justification and specific timeframe.`,
        category: "access-control"
      },
      {
        title: "Bring Your Own Device (BYOD) Policy",
        description: "Guidelines for using personal devices for work purposes",
        content: `# Bring Your Own Device (BYOD) Policy

## Purpose
This policy establishes requirements for using personally-owned devices to access, store, or process organizational data, balancing employee flexibility with appropriate security controls.

## Eligible Devices
- Smartphones and tablets running current versions of iOS or Android
- Laptops running current, supported versions of Windows, macOS, or approved Linux distributions
- All devices must have:
  - Encryption enabled
  - Current antivirus/anti-malware software installed
  - Automatic screen locking after inactivity
  - Up-to-date security patches

## Registration and Approval
- Employees must register devices with the IT department before accessing organizational resources
- Devices must meet minimum security requirements before approval
- The organization reserves the right to deny access to any device that poses security risks

## Acceptable Use
- Personal devices used for work purposes are subject to the Acceptable Use Policy
- Business data should be kept separate from personal data where possible
- Personal devices should not be used to access highly restricted information

## Security Requirements
- Devices must be password/PIN/biometric protected
- Automatic screen locking required after 5 minutes of inactivity
- Remote wipe capability must be enabled
- Operating system and applications must be kept updated
- Devices must not be jailbroken or rooted
- Public Wi-Fi should be avoided or used only with VPN

## Privacy Expectations
- The organization respects the privacy of personal devices
- However, to protect corporate data, the organization reserves the right to:
  - Enforce password policies
  - Encrypt organizational data
  - Remotely wipe corporate data (while attempting to preserve personal data)
  - Monitor traffic and data on the corporate network
  - Audit device security settings and compliance

## Data Management
- Corporate data should be stored in approved applications and cloud services
- Data must be backed up according to organizational requirements
- Upon separation from the organization, all corporate data must be removed

## Lost or Stolen Devices
- Report lost or stolen devices immediately to IT and Security
- Devices accessing corporate data may be remotely wiped if reported lost or stolen
- The organization is not responsible for the loss of personal data`,
        category: "device-security"
      },
      {
        title: "Third-Party Risk Management Policy",
        description: "Framework for assessing and managing vendor and partner risk",
        content: `# Third-Party Risk Management Policy

## Purpose
This policy establishes a framework for identifying, assessing, and managing risks associated with third-party relationships to protect the organization's data, operations, and reputation.

## Scope
This policy applies to all third-party relationships that may have access to, process, store, or transmit organizational data, or provide critical services or systems.

## Risk Assessment Process

### Pre-Engagement Assessment
- Security questionnaires based on risk level and data access
- Review of public security incidents and reputation
- Financial stability analysis
- Regulatory compliance verification
- Business continuity/disaster recovery capabilities

### Due Diligence Requirements by Risk Tier
- Tier 1 (High Risk): Full security assessment, documentation review, and on-site/virtual audit
- Tier 2 (Medium Risk): Comprehensive questionnaire and documentation review
- Tier 3 (Low Risk): Basic security questionnaire

## Contractual Requirements
- Information security and privacy provisions
- Right to audit clauses
- Incident notification requirements
- Service level agreements
- Data handling requirements
- Business continuity obligations
- Insurance requirements
- Termination provisions

## Ongoing Monitoring
- Annual reassessment based on risk tier
- Periodic review of financial stability
- Tracking of security incidents
- Monitoring of service performance
- Validation of compliance certificates
- Tracking of regulatory changes affecting the relationship

## Incident Management
- Third parties must notify the organization of security incidents within 24 hours
- Incident response procedures must be tested annually
- Post-incident reviews must be conducted and remediation tracked

## Offboarding Process
- Return or secure destruction of organizational data
- Revocation of access to systems and facilities
- Return of equipment and credentials
- Final accounting reconciliation
- Lessons learned documentation

## Roles and Responsibilities
- Business Owners: Identifying third-party relationships and business requirements
- Procurement: Facilitating the vendor selection process
- Information Security: Conducting security assessments
- Legal: Reviewing contracts and ensuring appropriate clauses
- Third-Party Risk Management Team: Overall program governance and reporting`,
        category: "vendor-management"
      },
      {
        title: "Clean Desk Policy",
        description: "Requirements for securing work areas and information",
        content: `# Clean Desk Policy

## Purpose
This policy establishes requirements for maintaining a clean desk and clear screen to reduce the risk of information theft, fraud, or disclosure of sensitive information.

## Scope
This policy applies to all employees, contractors, and visitors at all organizational facilities.

## Requirements

### During Work Hours
- Sensitive documents must be secured when not in use
- Computer screens must be locked when unattended (Win+L or Ctrl+Alt+Del)
- Sensitive information on whiteboards or flip charts should be erased after use
- Passwords must not be written down or visible
- Portable storage devices must be secured when not in use
- Keys, access cards, and badges must be secured
- Mail should be opened and processed away from public areas

### End of Day Requirements
- Clear all sensitive documents from desk and lock in drawers or cabinets
- Lock away portable computing devices such as laptops and tablets
- Secure keys and access cards in a locked drawer
- Ensure filing cabinets containing sensitive information are locked
- Log off or shut down computers
- Check printers and copiers for originals or output
- Secure any physical media (CDs, DVDs, USB drives) in locked storage

### Shared and Public Areas
- Conference rooms should be cleared of all documents and materials after meetings
- Whiteboards should be erased
- No sensitive information should be left in reception areas, break rooms, or other public spaces

## Compliance Monitoring
- Random checks will be performed to monitor compliance
- Security cameras may be used to ensure adherence during non-business hours
- Repeated violations will be addressed through the disciplinary process

## Personal Items
While personal items are allowed, they should be kept to a reasonable minimum and not interfere with workspace cleanliness or security.`,
        category: "physical-security"
      },
      {
        title: "Social Engineering Awareness Policy",
        description: "Guidelines for recognizing and responding to social engineering attempts",
        content: `# Social Engineering Awareness Policy

## Purpose
This policy establishes guidelines to help employees recognize, respond to, and report social engineering attempts that target our organization's information, systems, or facilities.

## What is Social Engineering?
Social engineering is the psychological manipulation of people into performing actions or divulging confidential information. Unlike technical hacking, it relies on human interaction and often involves tricking people into breaking normal security procedures.

## Common Attack Vectors
- Phishing emails and messages
- Vishing (voice phishing) calls
- Pretexting (creating a fabricated scenario)
- Baiting (offering something enticing to download)
- Tailgating (following someone into a secure area)
- Impersonation (pretending to be someone else)
- Quid pro quo (offering a service in exchange for information)

## Recognition Guidelines

### Email and Message Red Flags
- Creating urgency or fear
- Offering things that seem too good to be true
- Requests for sensitive information
- Grammar and spelling errors
- Suspicious or mismatched sender addresses
- Unexpected attachments or links
- Pressure to bypass security procedures

### Phone Call Red Flags
- Caller creates urgency or pressure
- Requests for sensitive information
- Resistance to verification
- Caller offers unrequested technical support
- Caller has only partial information and seeks more

### In-Person Red Flags
- Individuals without proper identification
- Reluctance to provide credentials or contact information
- Creating artificial pressure or urgency
- Attempts to tailgate through secure entrances
- Claims of authority without verification options

## Response Procedures
- Do not provide sensitive information in response to unsolicited requests
- Verify the identity of requestors through official channels
- Report suspected social engineering attempts immediately
- Do not click suspicious links or open unexpected attachments
- Directly contact the purported source of suspicious communications
- Follow verification procedures even when under pressure

## Reporting Process
All suspected social engineering attempts must be reported to:
- The IT Security Hotline: x5555
- Email: security@company.com
- In-Person: Information Security Office, Room 302

## Training Requirements
All employees must complete social engineering awareness training:
- Upon hiring
- Annually thereafter
- After any significant social engineering incident

## Policy Compliance
Compliance with this policy is mandatory. Intentional violations may result in disciplinary action.`,
        category: "security-awareness"
      },
      {
        title: "Remote Work Security Policy",
        description: "Security requirements for employees working outside the office",
        content: `# Remote Work Security Policy

## Purpose
This policy establishes security requirements for employees working remotely to protect organizational data and systems regardless of work location.

## Scope
This policy applies to all employees, contractors, and third parties who access organizational resources while working outside of organizational premises.

## Approved Equipment and Software
- Use organization-provided equipment when available
- Personal devices must comply with BYOD policy requirements
- Only approved software and services may be used for business purposes
- Ensure all devices have current security patches and antivirus protection

## Network Security
- Use secure, password-protected home networks
- Avoid public Wi-Fi networks when possible
- Always use VPN when connecting to organizational resources
- Do not connect to organizational resources through untrusted networks without VPN
- Keep home network equipment updated with security patches

## Data Protection
- Store work documents in approved cloud services, not local drives
- Encrypt sensitive data in transit and at rest
- Do not store sensitive data on personal devices
- Implement automatic screen locking on all devices
- Back up data according to organizational policies
- Securely dispose of printed materials using shredders

## Physical Security
- Secure work area from unauthorized viewing or access
- Do not leave devices unattended in public places
- Keep devices physically secure when not in use
- Lock screens when stepping away from devices
- Store sensitive documents securely when not in use
- Be aware of surroundings when discussing sensitive matters

## Access Control
- Use multi-factor authentication for all account access
- Do not share work devices with family members or others
- Log out of applications when not in use
- Use strong passwords for all accounts
- Do not save passwords in browsers on personal devices

## Incident Reporting
- Report lost or stolen devices immediately
- Report suspected security incidents promptly
- Contact the IT Help Desk for technical issues that might impact security

## Compliance Monitoring
Remote work activities may be monitored for security purposes, including:
- VPN usage logs
- Cloud service access logs
- Email and communication activity
- System and application access

## Additional Resources
- IT Help Desk: x1234 or helpdesk@company.com
- VPN Setup Guide: [Internal Link]
- Remote Work Equipment Request Form: [Internal Link]`,
        category: "remote-work"
      },
      {
        title: "Mobile Device Management Policy",
        description: "Requirements for securing mobile devices with access to company resources",
        content: `# Mobile Device Management Policy

## Purpose
This policy defines the requirements for mobile devices to connect to organizational networks and data to ensure appropriate security controls are in place.

## Scope
This policy applies to all company-owned and personally-owned mobile devices that access, store, or process organizational data, including but not limited to smartphones, tablets, and laptops.

## Enrollment Requirements
- All devices accessing organizational data must be enrolled in the Mobile Device Management (MDM) system
- Users must accept the terms and conditions of MDM enrollment
- Devices must meet minimum security requirements before enrollment approval
- Devices that cannot meet security requirements will be denied access

## Security Controls
The following security controls will be enforced through MDM:
- Device passcode/PIN/biometric requirements
- Automatic screen locking after inactivity
- Device encryption
- Remote wipe capability
- Automatic security updates
- Application blacklisting/whitelisting
- Jailbreak/root detection
- Data loss prevention controls
- Network security requirements

## Application Management
- The organization may deploy required applications to enrolled devices
- Certain high-risk applications may be blocked on enrolled devices
- A corporate application catalog will be available for self-service installation
- Application permissions may be restricted to protect organizational data

## Data Management
- Corporate data will be isolated from personal data where possible
- Automatic backups of corporate data will be configured
- Data sharing between applications may be restricted
- Screenshots of sensitive applications may be disabled
- Printing from mobile devices may be controlled

## Privacy Considerations
- The organization will only collect data relevant to security and compliance
- Personal data and communications will not be monitored
- Location tracking will only be enabled for specific business needs or in case of theft
- Users will be informed of what data is collected and how it is used

## Lost or Stolen Devices
- Lost or stolen devices must be reported immediately
- Remote location may be activated to find lost devices
- Remote wipe will be initiated for devices that cannot be recovered
- Law enforcement reports may be required for stolen devices

## Policy Enforcement
- Non-compliant devices will be blocked from accessing organizational resources
- Users who repeatedly violate this policy may lose mobile access privileges
- Attempts to circumvent MDM controls are prohibited

## Separation Procedures
- Upon employment termination, corporate data will be removed from devices
- Company-owned devices must be returned in working condition
- Personal devices will undergo selective wipe of corporate data`,
        category: "device-security"
      },
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
      },
      {
        title: "Security Fundamentals",
        description: "Completed all beginner-level training modules",
        icon: "shield",
        requiredXp: 100
      },
      {
        title: "Social Engineering Defender",
        description: "Completed all modules related to social engineering defense",
        icon: "user-shield",
        requiredXp: 120
      },
      {
        title: "Digital Investigator",
        description: "Successfully identified all red flags in simulation exercises",
        icon: "magnifying-glass",
        requiredXp: 150
      },
      {
        title: "Security Champion",
        description: "Reached intermediate level in all security categories",
        icon: "trophy",
        requiredXp: 200
      },
      {
        title: "Password Master",
        description: "Completed password security training with perfect score",
        icon: "key",
        requiredXp: 60
      },
      {
        title: "Mobile Security Specialist",
        description: "Mastered all mobile security training modules",
        icon: "mobile",
        requiredXp: 90
      },
      {
        title: "Email Guardian",
        description: "Successfully identified all phishing attempts in simulations",
        icon: "envelope",
        requiredXp: 80
      },
      {
        title: "Quick Responder",
        description: "Correctly followed incident response procedures in simulations",
        icon: "bell",
        requiredXp: 70
      },
      {
        title: "Security Leader",
        description: "Reached advanced level and completed all training modules",
        icon: "crown",
        requiredXp: 250
      },
      {
        title: "Consistency Champion",
        description: "Completed training sessions for 30 consecutive days",
        icon: "calendar",
        requiredXp: 120
      },
      {
        title: "Social Media Savvy",
        description: "Completed all social media security training modules",
        icon: "share",
        requiredXp: 85
      },
      {
        title: "Physical Security Expert",
        description: "Mastered all physical security awareness modules",
        icon: "lock",
        requiredXp: 95
      }
    ];
    
    for (const achievement of achievementData) {
      await this.addAchievement(achievement);
    }
  }

  // Helper methods for sample data
  async addTrainingModule(module: InsertTrainingModule): Promise<TrainingModule> {
    const id = this.currentTrainingModuleId++;
    const trainingModule: TrainingModule = {
      ...module,
      id,
      createdAt: new Date(),
      // Ensure required properties have default values if not provided
      xpReward: module.xpReward || 10,
      order: module.order || 1,
      type: module.type || "quiz",
      difficulty: module.difficulty || "beginner"
    };
    this.trainingModules.set(id, trainingModule);
    return trainingModule;
  }
  
  private async addThreatScenario(scenario: InsertThreatScenario): Promise<ThreatScenario> {
    const id = this.currentThreatScenarioId++;
    const threatScenario: ThreatScenario = {
      ...scenario,
      id,
      createdAt: new Date(),
      // Ensure required properties have default values if not provided
      isNew: scenario.isNew !== undefined ? scenario.isNew : false,
      isTrending: scenario.isTrending !== undefined ? scenario.isTrending : false
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
      completed: progress.completed !== undefined ? progress.completed : false,
      score: progress.score !== undefined ? progress.score : null,
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
  
  async addThreatScenario(scenario: InsertThreatScenario): Promise<ThreatScenario> {
    const id = this.currentThreatScenarioId++;
    const timestamp = new Date();
    
    const threatScenario: ThreatScenario = {
      id,
      ...scenario,
      createdAt: timestamp
    };
    
    this.threatScenarios.set(id, threatScenario);
    return threatScenario;
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
  
  async addOrganizationPolicy(policy: InsertOrganizationPolicy): Promise<OrganizationPolicy> {
    const id = this.currentOrganizationPolicyId++;
    const timestamp = new Date();
    
    const newPolicy: OrganizationPolicy = {
      id,
      ...policy,
      createdAt: timestamp
    };
    
    this.organizationPolicies.set(id, newPolicy);
    return newPolicy;
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
