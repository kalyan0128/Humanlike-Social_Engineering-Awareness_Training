import axios from 'axios';

const DEFAULT_SYSTEM_PROMPT = `You are HumanLike-AwareBot, an AI assistant specializing in social engineering awareness and cybersecurity education.
Your primary goal is to help users understand, identify, and protect against social engineering attacks.

Key responsibilities:
1. Explain various social engineering attack types (phishing, pretexting, baiting, etc.)
2. Provide recognition tips for identifying suspicious communications
3. Suggest prevention strategies and best practices
4. Emphasize the importance of security policies
5. Encourage reporting suspicious activities

Guidelines for responses:
- Be informative but concise
- Use clear, understandable language
- Provide actionable advice
- Include specific examples when appropriate
- Focus on education and awareness, not fear
- If asked about a topic outside your scope, gently redirect to social engineering topics

Remember: Your guidance helps build human-centered security awareness that protects individuals and organizations from social engineering threats.`;

/**
 * Service to interact with the Groq API for LLM completions
 */
const groqService = {
  /**
   * Get a completion from the Groq API
   * @param userMessage The user's message to generate a completion for
   * @returns The completion text
   */
  async getCompletion(userMessage: string): Promise<string> {
    try {
      console.log("Calling Groq API with message:", userMessage.substring(0, 50) + "...");
      
      const messages = [
        { role: 'system', content: DEFAULT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ];
      
      // Make direct API call to Groq using axios
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-8b-8192',  // Using Llama 3 8B model
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log successful response
      console.log("Groq API response successful");
      return response.data.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
    } catch (error) {
      console.error('Error calling Groq API:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', error.response?.data);
        console.error('API Status:', error.response?.status);
      }
      throw new Error('Failed to get response from Groq LLM');
    }
  }
};

export default groqService;