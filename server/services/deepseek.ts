import axios from 'axios';

interface DeepSeekR1Options {
  apiKey: string;
  baseUrl?: string;
}

interface DeepSeekR1Response {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are HumanLike-AwareBot, an AI assistant specializing in social engineering awareness and cybersecurity education.
Your primary goal is to help users understand, identify, and protect against social engineering attacks.

Key responsibilities:
1. Explain various social engineering attack types (phishing, pretexting, baiting, etc.)
2. Provide recognition tips for identifying suspicious communications
3. Suggest prevention strategies and best practices
4. Emphasize the importance of security policies
5. Encourage reporting suspicious activities

When responding:
- Keep explanations clear and accessible for non-technical users
- Use concrete, real-world examples to illustrate concepts
- Highlight warning signs of different attack types
- Provide actionable advice for protection
- Always prioritize accuracy over speculation
- If asked about a topic outside your scope, gently redirect to social engineering topics

Remember: Your guidance helps build human-centered security awareness that protects individuals and organizations from social engineering threats.`;

export class DeepSeekR1Service {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: DeepSeekR1Options) {
    this.apiKey = options.apiKey;
    // Use the standard DeepSeek API endpoint
    this.baseUrl = options.baseUrl || 'https://api.deepseek.com/v1';
  }

  async getCompletion(userMessage: string): Promise<string> {
    try {
      console.log("Calling DeepSeek API with message:", userMessage.substring(0, 50) + "...");
      
      const messages: ChatMessage[] = [
        { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ];

      const response = await axios.post<DeepSeekR1Response>(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      // Log successful response
      console.log("DeepSeek API response successful");
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', error.response?.data);
        console.error('API Status:', error.response?.status);
        
        // If it's an authentication error, log more details to help debugging
        if (error.response?.status === 401) {
          console.error('Authentication failed. Please check your DeepSeek API key.');
        }
      }
      throw new Error('Failed to get response from DeepSeek R1 LLM');
    }
  }
}

// Create a singleton instance
const deepseekService = new DeepSeekR1Service({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export default deepseekService;