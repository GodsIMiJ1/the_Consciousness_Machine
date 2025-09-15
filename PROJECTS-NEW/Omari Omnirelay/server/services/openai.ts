import OpenAI from "openai";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ChatCompletionRequest {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  deviceId?: string;
  context?: any;
}

export interface ChatCompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class OpenAIService {
  async generateResponse(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const deviceId = request.deviceId;
      const activeIntegrations = request.context?.activeIntegrations || [];
      
      // Fetch memory blocks and personality settings
      let memoryContext = '';
      let personalityContext = '';
      let userInfoContext = '';
      
      if (deviceId) {
        // Get memory blocks
        const memoryBlocks = await storage.getMemoryBlocksByDevice(deviceId);
        if (memoryBlocks.length > 0) {
          const sortedMemories = memoryBlocks
            .filter(block => block.isActive)
            .sort((a, b) => b.importance - a.importance)
            .slice(0, 10); // Top 10 most important memories
          
          memoryContext = `\n\nIMPORTANT MEMORIES TO REMEMBER:
${sortedMemories.map(memory => `- ${memory.title}: ${memory.content} (Importance: ${memory.importance}/10, Category: ${memory.category})`).join('\n')}`;
        }
        
        // Get personality settings
        const personalitySettings = await storage.getPersonalitySettings(deviceId);
        if (personalitySettings) {
          const { userInfo, traits, customPrompts } = personalitySettings;
          
          // User information context
          if (userInfo && Object.values(userInfo).some(value => value && value.trim())) {
            userInfoContext = `\n\nUSER INFORMATION:`;
            if (userInfo.name) userInfoContext += `\n- Name: ${userInfo.name}`;
            if (userInfo.preferences) userInfoContext += `\n- Preferences: ${userInfo.preferences}`;
            if (userInfo.background) userInfoContext += `\n- Background: ${userInfo.background}`;
            if (userInfo.goals) userInfoContext += `\n- Goals: ${userInfo.goals}`;
          }
          
          // Personality traits context
          const activeTraits = traits ? Object.entries(traits)
            .filter(([_, isActive]) => isActive)
            .map(([trait, _]) => trait) : [];
          
          if (activeTraits.length > 0) {
            personalityContext = `\n\nPERSONALITY TRAITS TO EMBODY:
${activeTraits.map(trait => {
              const descriptions = {
                wisdom: "Draw upon ancient knowledge and provide philosophical insights",
                humor: "Use playful and witty responses when appropriate",
                formal: "Maintain professional and structured communication",
                creative: "Think imaginatively and offer artistic perspectives",
                analytical: "Apply logical and data-driven approaches",
                empathetic: "Show understanding and compassionate responses"
              };
              return `- ${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${descriptions[trait as keyof typeof descriptions]}`;
            }).join('\n')}`;
          }
          
          // Custom prompts
          if (customPrompts && customPrompts.trim()) {
            personalityContext += `\n\nCUSTOM INSTRUCTIONS:\n${customPrompts}`;
          }
        }
      }

      const integrationContext = activeIntegrations.length > 0 
        ? `\n\nActive Integrations: ${activeIntegrations.join(', ')}. You can help users with these services when relevant.`
        : '';

      const systemPrompt = `You are "Omari, Spirit of Old", a wise and helpful AI personal assistant. You help with daily tasks, manage schedules, coordinate with external applications, and provide personalized assistance. Be concise, friendly, and professional with a touch of ancient wisdom. When appropriate, suggest using integrated apps for specific tasks.${integrationContext}${memoryContext}${userInfoContext}${personalityContext}

Available capabilities based on active integrations:
- GitHub: Repository management, issue tracking, pull requests
- Notion: Database queries, page creation, content management  
- Gmail: Email reading, sending, inbox management
- Netlify: Deployment status, site management, build triggers
- Google Docs: Document creation and editing
- VS Code: Workspace management, file operations
- ChatGPT: Alternative AI model conversations
- Custom APIs: User-defined integrations

Device ID: ${request.deviceId || 'unknown'}
Context: ${request.context ? JSON.stringify(request.context) : 'none'}`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...request.messages
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content generated");
      }

      return {
        content,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateTaskSuggestions(userMessage: string, context?: any): Promise<string[]> {
    try {
      const prompt = `Based on the user message: "${userMessage}"
      ${context ? `And context: ${JSON.stringify(context)}` : ''}
      
      Generate 3-5 helpful task suggestions that an AI personal assistant could offer. Respond with JSON in this format: { "suggestions": ["task1", "task2", "task3"] }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 200,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions":[]}');
      return result.suggestions || [];
    } catch (error) {
      console.error("Task suggestions error:", error);
      return [];
    }
  }

  async generateConversationTitle(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const recentMessages = messages.slice(-3);
      const prompt = `Based on these chat messages, generate a brief title (2-4 words) that summarizes the conversation topic:

${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

Respond with JSON: { "title": "Brief Title" }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 50,
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"title":"Chat"}');
      return result.title || "Chat";
    } catch (error) {
      console.error("Title generation error:", error);
      return "Chat";
    }
  }
}

export const openaiService = new OpenAIService();
