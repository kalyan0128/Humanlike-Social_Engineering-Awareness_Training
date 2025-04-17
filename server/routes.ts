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
import groqService from "./services/groq";

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
  // Route to add new threat scenarios
  app.post('/api/admin/add-threat-scenarios', async (req, res) => {
    try {
      // Add first scenario - Deepfake Fraud
      const scenario1 = await storage.addThreatScenario({
        title: "Deepfake Fraud",
        description: "Increasingly realistic AI-generated media is enabling sophisticated impersonation attacks.",
        content: "# Deepfake Fraud: The Growing Threat of AI-Powered Impersonation\n\nDeepfakes are synthetic media created using artificial intelligence that can superimpose faces, manipulate voices, or generate entirely fabricated content that appears remarkably genuine.\n\nAs this technology becomes more accessible, social engineers are weaponizing deepfakes for various fraudulent activities including executive impersonation, biometric authentication bypass, and relationship manipulation.\n\nDetection techniques include watching for visual inconsistencies, audio discrepancies, contextual analysis, and implementing verification protocols for high-risk requests.\n\nProtection strategies include using multi-factor authentication, establishing communication protocols for financial transactions, conducting awareness training, and creating authentication code words for sensitive communications.",
        difficulty: "advanced",
        isNew: true,
        isTrending: true
      });

      // Add second scenario - Supply Chain Attacks
      const scenario2 = await storage.addThreatScenario({
        title: "Supply Chain Attacks",
        description: "Targeting the less-secure elements in a supply chain to compromise the ultimate target.",
        content: "# Supply Chain Attacks: Exploiting the Weakest Links\n\nSupply chain attacks target organizations by exploiting vulnerabilities in their vendor networks rather than attacking well-defended targets directly.\n\nThese attacks follow a pattern: reconnaissance of vendors, vulnerability analysis to find the weakest link, initial compromise of the supplier, establishing persistence, pivoting to the ultimate target, and finally exploitation.\n\nCommon vectors include software supply chain attacks (like SolarWinds), hardware supply chain attacks (malicious components), and third-party service provider compromises.\n\nDefense strategies include vendor risk management (due diligence, monitoring, contractual requirements), software security practices (verifying downloads, controlled deployment), and operational security measures (network segmentation, verification protocols for unusual requests).",
        difficulty: "intermediate",
        isNew: true,
        isTrending: false
      });

      // Add third scenario - Business Email Compromise
      const scenario3 = await storage.addThreatScenario({
        title: "Business Email Compromise",
        description: "Sophisticated email scams targeting businesses to conduct unauthorized fund transfers.",
        content: "# Business Email Compromise: The Billion-Dollar Threat\n\nBusiness Email Compromise (BEC) is a sophisticated scam targeting businesses with social engineering tactics to trick employees into making unauthorized fund transfers or revealing sensitive information.\n\nCommon scenarios include CEO fraud (urgent wire transfer requests), vendor/supplier swindles (modified payment instructions), attorney impersonation (time-sensitive legal matters), and data theft variants targeting sensitive company information.\n\nWarning signs include requests for urgency or secrecy, slight variations in email addresses, grammar inconsistencies, changed payment details, pressure to act quickly, and communication limited to email only.\n\nProtection requires both organizational controls (verification protocols, approval processes, employee training) and individual vigilance (verifying unusual requests through different channels, checking email addresses carefully).",
        difficulty: "intermediate",
        isNew: true,
        isTrending: true
      });

      console.log("Added threat scenarios:", [scenario1.id, scenario2.id, scenario3.id]);
      res.status(201).json({ message: "Threat scenarios added successfully" });
    } catch (error) {
      console.error("Error adding threat scenarios:", error);
      res.status(500).json({ message: "Error adding threat scenarios" });
    }
  });
  
  // Route to add new organization policies
  app.post('/api/admin/add-policies', async (req, res) => {
    try {
      // Add Mobile Device Security Policy
      await storage.addOrganizationPolicy({
        title: "Mobile Device Security Policy",
        description: "Guidelines for securing mobile devices that access organizational data.",
        category: "device-security",
        content: "# Mobile Device Security Policy\n\n## Purpose\n\nThe purpose of this policy is to define standards, procedures, and restrictions for end users who have legitimate business requirements to access company data from mobile devices. This Mobile Device Security Policy applies to company-owned and personally-owned mobile devices that access, store, or process company data.\n\n## Scope\n\nThis policy applies to all employees, contractors, vendors, and agents who utilize either company-owned or personally-owned mobile devices to access, store, or manipulate company data.\n\n## Policy Statements\n\n### Device Security Requirements\n\n1. **Passcode Protection**: All mobile devices must use a strong passcode or biometric authentication (fingerprint, face recognition) with the following minimum requirements:\n   - Minimum length of 6 characters\n   - Complex passcode (combination of letters, numbers, and special characters) recommended\n   - Auto-lock enabled after maximum 5 minutes of inactivity\n   - Maximum of 10 consecutive unsuccessful login attempts before data wipe\n\n2. **Operating System and Applications**:\n   - Devices must maintain updated operating systems within 30 days of release\n   - Applications must be updated regularly to the most current stable versions\n   - Only applications from official app stores (Apple App Store, Google Play Store) are permitted\n   - Applications requiring excessive permissions must be reviewed by IT before installation\n\n3. **Encryption**:\n   - Full-device encryption must be enabled\n   - Company data stored on the device must be encrypted\n   - When transmitting sensitive information, secure transmission protocols must be used\n\n4. **Remote Management and Wiping**:\n   - All devices accessing company resources must be enrolled in the company's Mobile Device Management (MDM) solution\n   - Lost or stolen devices must be reported to IT immediately for remote wiping\n   - Employees must authorize the company to remotely wipe devices if lost, stolen, or upon termination of employment\n\n### Usage Restrictions\n\n1. **Acceptable Use**:\n   - Company resources must only be used for legitimate business purposes\n   - Personal use should be limited and must not interfere with job duties\n   - Prohibited activities include:\n     - Accessing illegal content\n     - Harassment or discriminatory communications\n     - Sharing confidential company information on public forums\n     - Installing unauthorized software\n\n2. **Data Storage and Sharing**:\n   - Sensitive company data should not be permanently stored on mobile devices when possible\n   - Cloud storage solutions must be company-approved\n   - File sharing applications must be approved by IT\n   - Automatic cloud backups containing company data must be to approved services only\n\n3. **Network Connectivity**:\n   - Public Wi-Fi should be avoided when accessing sensitive company information\n   - Use of VPN is required when connecting to company resources from unsecured networks\n   - Bluetooth and other wireless protocols should be disabled when not in use\n\n### Personal Devices (BYOD)\n\n1. **Enrollment Requirements**:\n   - Personal devices must be approved by IT before connecting to company resources\n   - Users must agree to MDM enrollment and the terms of this policy\n   - Company applications and data must be isolated from personal applications when possible\n\n2. **Support Limitations**:\n   - IT will provide limited support for personal devices\n   - Hardware issues are the responsibility of the device owner\n   - The company is not responsible for personal data loss during troubleshooting or remote wiping\n\n3. **Termination Procedures**:\n   - Upon termination of employment, all company data will be removed from personal devices\n   - Personal devices may be wiped entirely if segregation of company data cannot be assured\n\n## Compliance and Enforcement\n\n1. **Policy Violations**:\n   - Violations may result in revocation of mobile device privileges\n   - Serious or repeated violations may result in disciplinary action up to and including termination\n\n2. **Monitoring and Auditing**:\n   - The company reserves the right to monitor and audit mobile devices that access company resources\n   - Monitoring will be limited to company data and applications\n\n## Policy Review\n\nThis policy will be reviewed annually and updated as needed to reflect changes in technology, business needs, or regulatory requirements.\n\n---\n\n**Policy Version**: 1.2  \n**Last Updated**: March 10, 2025  \n**Approved by**: Chief Information Security Officer"
      });

      // Add Remote Work Security Policy
      await storage.addOrganizationPolicy({
        title: "Remote Work Security Policy",
        description: "Security requirements for employees working outside traditional office environments.",
        category: "remote-work",
        content: "# Remote Work Security Policy\n\n## Purpose\n\nThis Remote Work Security Policy establishes guidelines and requirements for employees who work outside of the organization's physical locations. It aims to maintain information security standards and protect company assets and data while enabling workforce flexibility.\n\n## Scope\n\nThis policy applies to all employees, contractors, consultants, temporary staff, and other workers who access company systems and data while working remotely, whether occasionally or on a regular basis.\n\n## Policy Statements\n\n### Eligibility and Authorization\n\n1. **Approval Process**:\n   - Remote work arrangements must be approved by both the employee's direct manager and the IT department\n   - Eligibility is determined by job responsibilities, security requirements, and demonstrated ability to work independently\n   - Permissions may be revoked due to security concerns or performance issues\n\n2. **Security Assessment**:\n   - A security assessment of the remote work environment may be required before approval\n   - Remote workers must allow periodic reassessment as requested by IT or security teams\n\n### Equipment and Environment\n\n1. **Company-Issued Equipment**:\n   - Company-issued devices should be used for remote work whenever possible\n   - Company equipment must not be modified without IT approval\n   - Only authorized users may use company-issued equipment\n   - Loss or theft of equipment must be reported immediately\n\n2. **Personal Devices**:\n   - If personal devices are approved for use, they must:\n     - Meet minimum security requirements as defined by IT\n     - Be enrolled in the company's Mobile Device Management (MDM) solution\n     - Have company data segregated from personal data\n     - Maintain current operating systems and security updates\n\n3. **Physical Security**:\n   - Equipment must be physically secured when not in use\n   - Devices should never be left unattended in public places\n   - Screens must be positioned to prevent unauthorized viewing\n   - Remote workers should have a secure, private workspace for confidential work\n\n### Network and Connection Security\n\n1. **Internet Connection**:\n   - Remote workers must use secure and reliable internet connections\n   - Public Wi-Fi networks should be avoided when possible\n   - When public Wi-Fi is necessary, a company-approved VPN must be used\n   - Home wireless networks must use WPA2 or WPA3 encryption with strong passwords\n\n2. **VPN Requirements**:\n   - Company VPN must be used when accessing internal resources\n   - Split tunneling is prohibited for sensitive operations\n   - VPN connections that are idle for more than 30 minutes will be automatically disconnected\n\n3. **Access Controls**:\n   - Multi-factor authentication (MFA) is required for all remote access\n   - Remote sessions should be logged out or locked when unattended\n   - Failed access attempts should be limited and monitored\n\n### Data Protection\n\n1. **Data Storage and Transfer**:\n   - Company data should be stored on approved company systems, not on local devices\n   - When local storage is necessary, files must be encrypted\n   - Physical documents containing sensitive information must be properly stored and disposed of\n   - External storage devices must be encrypted and approved by IT\n\n2. **Backup Requirements**:\n   - Critical work must be backed up to company-approved systems\n   - Personal backup solutions should not be used for company data\n\n3. **Confidentiality**:\n   - Remote workers must ensure conversations about confidential matters cannot be overheard\n   - Screen privacy filters should be used in public settings\n   - Video conferencing backgrounds should be neutral and professional\n   - Household members must not have access to company information\n\n### Incident Response\n\n1. **Reporting Requirements**:\n   - Security incidents must be reported immediately to the IT security team\n   - Signs of compromise, suspicious activities, or policy violations must be reported\n   - Remote workers should be familiar with the incident response procedure\n\n2. **Containment Procedures**:\n   - Upon detection of a security incident, remote workers should:\n     - Disconnect from the network (but do not power off the device)\n     - Contact the IT security team immediately\n     - Preserve evidence and follow security team instructions\n\n## Compliance and Monitoring\n\n1. **Compliance Monitoring**:\n   - The company reserves the right to monitor remote access and activities for security purposes\n   - Remote devices may be subject to security scans and audits\n   - Monitoring will focus on security and compliance, not employee surveillance\n\n2. **Consequences of Non-Compliance**:\n   - Policy violations may result in revocation of remote work privileges\n   - Serious violations may result in disciplinary action up to and including termination\n\n## Policy Review\n\nThis policy will be reviewed annually and updated as needed to reflect changes in technology, business needs, or regulatory requirements.\n\n---\n\n**Policy Version**: 2.1  \n**Last Updated**: February 15, 2025  \n**Approved by**: Chief Information Security Officer"
      });

      // Add Social Media Security Policy
      await storage.addOrganizationPolicy({
        title: "Social Media Security Policy",
        description: "Guidelines for secure and responsible use of social media platforms.",
        category: "communications",
        content: "# Social Media Security Policy\n\n## Purpose\n\nThis Social Media Security Policy establishes guidelines for the secure and appropriate use of social media platforms by employees. It aims to protect the organization's reputation, confidential information, and security posture while enabling effective communication and engagement through social media channels.\n\n## Scope\n\nThis policy applies to all employees, contractors, consultants, and temporary staff who use social media in any capacity that could affect the organization, whether through official company accounts or personal accounts that identify their affiliation with the company.\n\n## Policy Statements\n\n### General Guidelines\n\n1. **Applicability**:\n   - This policy applies to all social media platforms including but not limited to: LinkedIn, Twitter, Facebook, Instagram, TikTok, YouTube, Reddit, and personal blogs\n   - These guidelines apply to both professional and personal use when there is a connection to the organization\n\n2. **Personal Responsibility**:\n   - Employees are personally responsible for content they publish online\n   - Posts reflecting affiliation with the company should include a disclaimer that views expressed are personal\n   - Use good judgment and consider potential consequences before posting\n\n### Security Considerations\n\n1. **Account Security**:\n   - Official company social media accounts must use:\n     - Strong, unique passwords (minimum 14 characters)\n     - Multi-factor authentication (MFA)\n     - Company-approved email addresses\n     - Regular password rotation (every 90 days)\n   - Personal accounts used for professional purposes should follow similar security practices\n\n2. **Access Management**:\n   - Access to official accounts must be limited to authorized personnel only\n   - Access rights must be promptly removed when no longer required\n   - A central registry of account owners and administrators should be maintained\n   - Shared accounts must use a company-approved password management solution\n\n3. **Device and Application Security**:\n   - Social media should only be accessed from secure, updated devices\n   - Third-party applications and integrations with social platforms must be approved by IT\n   - Be cautious of social media applications requesting excessive permissions\n   - Regularly review and revoke unnecessary application permissions\n\n### Content Guidelines\n\n1. **Confidential Information**:\n   - Never share confidential business information including:\n     - Unreleased products or features\n     - Financial data not publicly disclosed\n     - Internal communications or memos\n     - Customer information\n     - Proprietary processes or methodologies\n   - Be aware that aggregation of non-confidential information may reveal confidential patterns\n\n2. **Security Awareness**:\n   - Do not share information that could compromise physical or information security:\n     - Office locations and layouts\n     - Details about security controls or procedures\n     - Technology stack, versions, or infrastructure details\n     - Names or contact information of security personnel\n\n3. **Privacy Considerations**:\n   - Respect the privacy of colleagues, customers, and business partners\n   - Obtain proper consent before posting images or quotes from others\n   - Be mindful of location data and metadata in posts and images\n\n### Social Engineering Defense\n\n1. **Threat Awareness**:\n   - Be vigilant about social engineering attempts through social media:\n     - Suspicious connection requests\n     - Unusual messages from connections\n     - Requests for information or action from unfamiliar sources\n     - Job offers or opportunities that seem suspicious\n\n2. **Information Disclosure**:\n   - Limit personal information shared on social profiles, including:\n     - Detailed job descriptions that reveal sensitive operations\n     - Work schedules and travel plans\n     - Organizational reporting structures\n     - Responses to common security questions (birthplace, schools, etc.)\n\n3. **Link and Content Safety**:\n   - Exercise caution with links received through social media\n   - Verify sources before clicking or downloading content\n   - Report suspicious activity to the security team\n\n### Incident Response\n\n1. **Account Compromise**:\n   - If a social media account is compromised:\n     - Immediately report to IT security\n     - Change passwords across all potentially affected accounts\n     - Contact the platform's support team\n     - Document unauthorized posts or messages\n\n2. **Misinformation Management**:\n   - If false information about the company is spreading on social media:\n     - Report to the communications department\n     - Do not engage personally unless authorized\n     - Document the misinformation\n\n## Compliance and Enforcement\n\n1. **Monitoring**:\n   - The company reserves the right to monitor public social media activity that references the organization\n   - Active monitoring will be performed for official company accounts and authorized spokespersons\n\n2. **Consequences**:\n   - Violations of this policy may result in disciplinary action\n   - Serious breaches may result in termination of employment\n\n## Policy Review\n\nThis policy will be reviewed annually and updated as needed to reflect changes in social media platforms, security threats, or business requirements.\n\n---\n\n**Policy Version**: 1.5  \n**Last Updated**: January 24, 2025  \n**Approved by**: Chief Communications Officer and Chief Information Security Officer"
      });

      res.status(201).json({ message: "Organization policies added successfully" });
    } catch (error) {
      console.error("Error adding organization policies:", error);
      res.status(500).json({ message: "Error adding organization policies" });
    }
  });

  // Route to add new Cryptography and MITM modules
  app.post('/api/admin/add-modules', async (req, res) => {
    try {
      // Add Cryptography training module
      await storage.addTrainingModule({
        title: "Introduction to Cryptography",
        description: "Learn the fundamentals of cryptography and how it protects your data.",
        type: "article",
        difficulty: "intermediate",
        content: "# Introduction to Cryptography\n\nCryptography is the science of securing communications and data through encoding techniques. In today's digital world, it forms the backbone of information security and privacy.\n\n## The Importance of Cryptography\n\nCryptography serves several critical purposes in digital security:\n\n- **Confidentiality**: Keeping information private from unauthorized parties\n- **Integrity**: Ensuring information hasn't been altered\n- **Authentication**: Verifying the identity of parties in communication\n- **Non-repudiation**: Preventing denial of having sent a message\n\n## Key Cryptographic Concepts\n\n### Encryption and Decryption\n\nEncryption is the process of converting plaintext (readable data) into ciphertext (scrambled data) using an algorithm and a key. Decryption reverses this process, converting ciphertext back to plaintext.\n\n### Symmetric vs. Asymmetric Encryption\n\n#### Symmetric Encryption\n\nIn symmetric encryption, the same key is used for both encryption and decryption.\n\n**Advantages**:\n- Fast and efficient for large amounts of data\n- Relatively simple implementation\n\n**Disadvantages**:\n- Key distribution problem: How do you securely share the key?\n- Not scalable for many users (requires n(n-1)/2 keys for n users)\n\n**Examples**: AES (Advanced Encryption Standard), DES (Data Encryption Standard)\n\n#### Asymmetric Encryption (Public Key Cryptography)\n\nIn asymmetric encryption, different keys are used for encryption and decryption: a public key for encryption and a private key for decryption.\n\n**Advantages**:\n- Solves the key distribution problem\n- Enables secure communication without prior shared secrets\n- Supports digital signatures\n\n**Disadvantages**:\n- Slower than symmetric encryption\n- More complex implementation\n\n**Examples**: RSA, ECC (Elliptic Curve Cryptography)\n\n### Hashing\n\nHashing is a one-way function that converts input data of any size into a fixed-size string of characters. Unlike encryption, hashing is not reversible.\n\n**Key Properties**:\n- Same input always produces same output\n- Small change in input produces significantly different output\n- Computationally infeasible to reverse\n- Extremely unlikely for two different inputs to produce the same output (collision resistance)\n\n**Uses**:\n- Password storage\n- Data integrity verification\n- Digital signatures\n\n**Examples**: SHA-256, MD5 (considered insecure now), bcrypt\n\n## Common Applications of Cryptography\n\n### Secure Communications\n\n**TLS/SSL**: Secures websites (HTTPS), email, and other internet communications by providing encryption, authentication, and integrity.\n\n### Secure Storage\n\n**Full Disk Encryption**: Protects data at rest on devices using tools like BitLocker, FileVault, or LUKS.\n\n### Digital Signatures\n\nUsing asymmetric cryptography to verify the authenticity and integrity of messages or documents.\n\n### Password Protection\n\nSecurely storing password hashes rather than plaintext passwords.\n\n## Best Practices for Using Cryptography\n\n1. **Don't create your own cryptographic algorithms** - Use established, peer-reviewed standards\n2. **Keep cryptographic keys secure** - Protect private keys at all costs\n3. **Use appropriate key lengths** - Longer keys generally provide more security\n4. **Implement proper key management** - Rotate keys periodically, handle key revocation\n5. **Stay updated** - Cryptographic standards evolve as vulnerabilities are discovered\n\n## The Future of Cryptography\n\n### Quantum Cryptography\n\nQuantum computing poses threats to current cryptographic methods, particularly asymmetric algorithms like RSA. Post-quantum cryptography is being developed to address these challenges.\n\n### Homomorphic Encryption\n\nAllows computation on encrypted data without decrypting it, enabling secure cloud computing and data analysis while preserving privacy.\n\n## Conclusion\n\nCryptography is essential for protecting digital information and communications. Understanding its basic principles helps you make informed decisions about your digital security practices and appreciate the technology that keeps your data safe.",
        xpReward: 25,
        order: 5
      });
      
      // Add Cryptography Quiz module
      await storage.addTrainingModule({
        title: "Cryptography Quiz",
        description: "Test your knowledge of cryptographic concepts and applications.",
        type: "quiz", 
        difficulty: "intermediate",
        content: JSON.stringify({
          introduction: "This quiz will test your understanding of cryptography fundamentals, including encryption types, hashing, and security applications.",
          questions: [
            {
              id: 1,
              question: "What is the main difference between symmetric and asymmetric encryption?",
              options: [
                "Symmetric encryption is more secure than asymmetric encryption",
                "Symmetric encryption uses the same key for encryption and decryption, while asymmetric uses different keys",
                "Symmetric encryption is only used for hashing passwords",
                "Asymmetric encryption can only encrypt small amounts of data"
              ],
              correctAnswer: 1,
              explanation: "Symmetric encryption uses a single key for both encryption and decryption, while asymmetric encryption uses a key pair: a public key for encryption and a private key for decryption."
            },
            {
              id: 2,
              question: "Which of the following is NOT a primary purpose of cryptography?",
              options: [
                "Confidentiality",
                "Integrity",
                "Authentication",
                "Data compression"
              ],
              correctAnswer: 3,
              explanation: "While cryptography serves many purposes including confidentiality (keeping data private), integrity (ensuring data hasn't been altered), and authentication (verifying identities), data compression is a separate function aimed at reducing data size, not securing it."
            },
            {
              id: 3,
              question: "What is hashing in cryptography?",
              options: [
                "Encrypting data with a private key",
                "A reversible encryption technique",
                "A one-way function that converts input data to a fixed-size output",
                "The process of key exchange between parties"
              ],
              correctAnswer: 2,
              explanation: "Hashing is a one-way cryptographic function that transforms input data of any size into a fixed-size output (hash value). Unlike encryption, hashing is not meant to be reversed - you cannot retrieve the original data from a hash."
            },
            {
              id: 4,
              question: "Which protocol secures websites using cryptography?",
              options: [
                "HTTP",
                "FTP",
                "TLS/SSL",
                "SMTP"
              ],
              correctAnswer: 2,
              explanation: "TLS (Transport Layer Security) and its predecessor SSL (Secure Sockets Layer) are cryptographic protocols that provide secure communication over networks, most notably for securing websites (HTTPS)."
            },
            {
              id: 5,
              question: "Why should you not create your own cryptographic algorithm?",
              options: [
                "It's illegal in most countries",
                "Proven algorithms are already optimized for performance",
                "Custom algorithms haven't been tested against known attacks and likely contain vulnerabilities",
                "Custom algorithms require too much computing power"
              ],
              correctAnswer: 2,
              explanation: "Creating secure cryptographic algorithms requires extensive expertise and rigorous peer review. Established algorithms have undergone years of analysis and testing by cryptography experts. Custom algorithms almost certainly contain vulnerabilities that an attacker could exploit."
            }
          ]
        }),
        xpReward: 30,
        order: 6
      });
      
      // Add Man-in-the-Middle Attack training module
      await storage.addTrainingModule({
        title: "Understanding Man-in-the-Middle Attacks",
        description: "Learn how attackers can intercept and manipulate your communications.",
        type: "article",
        difficulty: "intermediate",
        content: "# Understanding Man-in-the-Middle (MITM) Attacks\n\nA Man-in-the-Middle (MITM) attack is a type of cybersecurity threat where an attacker secretly intercepts and possibly alters the communication between two parties who believe they are directly communicating with each other.\n\n## How MITM Attacks Work\n\nIn a MITM attack, the attacker positions themselves between the victim and a legitimate service:\n\n1. **Interception**: The attacker first intercepts the communication channel between the victim and the intended recipient.\n2. **Decryption** (if applicable): The attacker may attempt to decrypt any encrypted data.\n3. **Data Theft/Modification**: The attacker can view sensitive information passing through the channel and potentially modify it.\n4. **Re-encryption/Forwarding**: The attacker passes the data (original or modified) to the intended recipient to avoid detection.\n\n## Common Types of MITM Attacks\n\n### Wi-Fi Eavesdropping\n\nAttackers can set up rogue Wi-Fi access points with names similar to legitimate networks (like \"Airport_Free_WiFi\") to trick users into connecting. Once connected, all unencrypted traffic can be monitored.\n\n### ARP Spoofing\n\nAddress Resolution Protocol (ARP) spoofing involves sending fake ARP messages to link the attacker's MAC address with the IP address of a legitimate network resource, redirecting traffic through the attacker's device.\n\n### DNS Spoofing\n\nBy corrupting Domain Name System (DNS) data, attackers can redirect users from legitimate websites to fraudulent ones that mimic the originals but are designed to steal credentials or install malware.\n\n### SSL/TLS Interception\n\nAlso known as SSL stripping, this attack downgrades a secure HTTPS connection to HTTP, allowing the attacker to view the data in plain text before forwarding it to its destination.\n\n### Session Hijacking\n\nBy capturing authentication tokens or cookies, attackers can take over established sessions between a user and a service, gaining unauthorized access.\n\n## Real-World Examples\n\n### Public Wi-Fi Risks\n\nUnsecured public Wi-Fi in cafes, airports, and hotels presents a significant risk for MITM attacks, as anyone can monitor unencrypted traffic on these networks.\n\n### Banking and Financial Fraud\n\nAttackers can intercept communications between users and financial institutions to steal credentials or manipulate transactions.\n\n### Corporate Espionage\n\nMITM attacks can be used to steal sensitive corporate information or intellectual property as it's transmitted across networks.\n\n## Detecting MITM Attacks\n\nSigns that may indicate a MITM attack include:\n\n- Unexpected certificate warnings in browsers\n- Sudden changes in website appearance or behavior\n- Unusual network latency\n- HTTP connections when HTTPS is expected\n- Unexpected logout events\n\n## Protecting Against MITM Attacks\n\n### For Individuals\n\n1. **Verify HTTPS Connections**: Always check that websites use HTTPS, especially when entering sensitive information. Look for the padlock icon in your browser's address bar.\n\n2. **Be Cautious with Public Wi-Fi**: Avoid accessing sensitive accounts or information when using public Wi-Fi. Consider using a VPN for additional security.\n\n3. **Use Multi-Factor Authentication**: Even if credentials are compromised, MFA provides an additional layer of security.\n\n4. **Keep Software Updated**: Ensure your operating system, browsers, and applications have the latest security patches.\n\n5. **Check Certificate Information**: Verify certificate details for sensitive websites to ensure they're legitimate.\n\n### For Organizations\n\n1. **Implement HTTPS Everywhere**: Use TLS/SSL for all web services and internal communications.\n\n2. **Use Certificate Pinning**: This technique associates a host with its expected certificate or public key to prevent certificate substitution attacks.\n\n3. **Deploy Network Monitoring Tools**: These can detect unusual traffic patterns that might indicate a MITM attack.\n\n4. **Implement Strong Authentication**: Use mutual authentication where both the client and server verify each other's identity.\n\n5. **Educate Users**: Train employees to recognize signs of MITM attacks and follow security best practices.\n\n## Advanced Protection Measures\n\n### Virtual Private Networks (VPNs)\n\nVPNs encrypt all network traffic between your device and the VPN server, creating a secure tunnel that helps protect against MITM attacks, especially on unsecured networks.\n\n### HTTPS Everywhere\n\nThis browser extension automatically switches thousands of sites from HTTP to HTTPS for more secure browsing.\n\n### HSTS (HTTP Strict Transport Security)\n\nHSTS is a web security policy mechanism that helps protect websites against protocol downgrade attacks and cookie hijacking by enforcing secure connections.\n\n## Conclusion\n\nMan-in-the-Middle attacks remain a persistent threat in our increasingly connected world. By understanding how these attacks work and implementing appropriate security measures, individuals and organizations can significantly reduce their risk. Always remain vigilant about your digital communications, especially when transmitting sensitive information.",
        xpReward: 25,
        order: 7
      });
      
      // Add Man-in-the-Middle Attack Quiz module
      await storage.addTrainingModule({
        title: "Man-in-the-Middle Attack Quiz",
        description: "Test your knowledge of MITM attacks and prevention strategies.",
        type: "quiz",
        difficulty: "intermediate",
        content: JSON.stringify({
          introduction: "This quiz will test your understanding of Man-in-the-Middle attacks, how they work, and how to protect against them.",
          questions: [
            {
              id: 1,
              question: "What is the primary goal of a Man-in-the-Middle attack?",
              options: [
                "Denial of service to legitimate users",
                "Intercepting communications between two parties",
                "Destroying data on target systems",
                "Creating backdoors in software applications"
              ],
              correctAnswer: 1,
              explanation: "The primary goal of a Man-in-the-Middle (MITM) attack is to secretly intercept communications between two parties who believe they are directly communicating with each other. This allows attackers to eavesdrop on sensitive information or even alter the communication."
            },
            {
              id: 2,
              question: "Which of the following is NOT a common type of Man-in-the-Middle attack?",
              options: [
                "ARP spoofing",
                "DNS spoofing",
                "SQL injection",
                "SSL stripping"
              ],
              correctAnswer: 2,
              explanation: "SQL injection is not a Man-in-the-Middle attack. It's a code injection technique targeting databases. ARP spoofing, DNS spoofing, and SSL stripping are all techniques used in MITM attacks to intercept communications."
            },
            {
              id: 3,
              question: "What security feature helps protect against MITM attacks on websites?",
              options: [
                "Strong passwords",
                "HTTPS with certificate validation",
                "Regular software updates",
                "Antivirus software"
              ],
              correctAnswer: 1,
              explanation: "HTTPS with certificate validation helps protect against MITM attacks by encrypting the communication between the browser and the website, while also verifying the identity of the website through digital certificates."
            },
            {
              id: 4,
              question: "Why are public Wi-Fi networks particularly vulnerable to MITM attacks?",
              options: [
                "They have more users than private networks",
                "They often lack proper encryption and authentication",
                "They use older router hardware",
                "They have higher bandwidth capabilities"
              ],
              correctAnswer: 1,
              explanation: "Public Wi-Fi networks are particularly vulnerable to MITM attacks because they often lack proper encryption and authentication. Many public networks use open authentication (no password) or share passwords publicly, making it easier for attackers to join the network and intercept traffic."
            },
            {
              id: 5,
              question: "Which of the following is the best protection against MITM attacks when using public Wi-Fi?",
              options: [
                "Clearing browser cookies frequently",
                "Using incognito/private browsing mode",
                "Using a VPN (Virtual Private Network)",
                "Changing passwords regularly"
              ],
              correctAnswer: 2,
              explanation: "Using a VPN (Virtual Private Network) provides the best protection against MITM attacks on public Wi-Fi because it encrypts all network traffic between your device and the VPN server, creating a secure tunnel that prevents attackers from reading or modifying your data."
            }
          ]
        }),
        xpReward: 30,
        order: 8
      });
      
      res.status(200).json({ message: "New training modules added successfully" });
    } catch (error) {
      console.error("Error adding new modules:", error);
      res.status(500).json({ message: "Failed to add new modules", error: error.message });
    }
  });
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
      
      // Get next recommended modules - increased limit to show new cryptography and MITM modules
      const recommendedModules = await storage.getNextRecommendedModules(userId, 4);
      console.log("Recommended modules:", recommendedModules);
      
      // Get latest threat scenarios
      const latestThreats = await storage.getThreatScenarios(2);
      
      // Get organization policies - increased limit to show all policies
      const policies = await storage.getOrganizationPolicies(10);
      
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
  
  // Threat scenarios endpoints - public access
  app.get("/api/threat-scenarios", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const scenarios = await storage.getThreatScenarios(limit);
      res.json(scenarios);
    } catch (error) {
      console.error("Error retrieving threat scenarios:", error);
      res.status(500).json({ message: "Error retrieving threat scenarios" });
    }
  });
  
  app.get("/api/threat-scenarios/:id", async (req, res) => {
    try {
      const scenarioId = parseInt(req.params.id);
      const scenario = await storage.getThreatScenario(scenarioId);
      
      if (!scenario) {
        return res.status(404).json({ message: "Threat scenario not found" });
      }
      
      res.json(scenario);
    } catch (error) {
      console.error("Error retrieving threat scenario:", error);
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
      
      let botResponse = "";
      try {
        // Generate bot response using Groq LLM API
        botResponse = await groqService.getCompletion(message);
      } catch (apiError) {
        console.error("Groq API error:", apiError);
        // Fallback to mock response if API fails
        botResponse = await mockLLMResponse(message);
      }
      
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
      console.error("Chat message processing error:", error);
      res.status(500).json({ message: "Error processing chat message" });
    }
  });

  return httpServer;
}
