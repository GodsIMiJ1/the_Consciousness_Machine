import { ChatPayload, Context } from '../schemas/envelope.js';
import { emitMessageCreated, emitConversationCreated } from '../handlers/emit.js';

/**
 * Chat domain handler - integrates with existing Omari chat system
 */
export class ChatHandler {
  /**
   * Handle chat request through Omnirelay
   */
  static async handleChat(
    deviceId: string,
    payload: ChatPayload,
    context?: Context
  ): Promise<any> {
    try {
      const { input, conversation_id, tools } = payload;

      // Get or create conversation
      let conversationId = conversation_id;
      if (!conversationId) {
        const conversation = await this.createConversation(deviceId);
        conversationId = conversation.id;
        
        // Emit conversation created event
        await emitConversationCreated(deviceId, conversation);
      }

      // Prepare chat request for existing Omari API
      const chatRequest = {
        conversationId,
        message: input,
        deviceId,
        tools: tools || []
      };

      // Call existing Omari chat endpoint
      const chatResponse = await this.callOmariChat(chatRequest);

      // Emit message events
      if (chatResponse.userMessage) {
        await emitMessageCreated(deviceId, conversationId, chatResponse.userMessage);
      }
      if (chatResponse.assistantMessage) {
        await emitMessageCreated(deviceId, conversationId, chatResponse.assistantMessage);
      }

      return {
        conversation_id: conversationId,
        response: chatResponse.assistantMessage?.content || '',
        usage: chatResponse.usage,
        tools_used: tools || []
      };
    } catch (error) {
      console.error('Chat handler error:', error);
      throw new Error(`Chat processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new conversation
   */
  private static async createConversation(deviceId: string): Promise<any> {
    try {
      // Call existing Omari conversation creation API
      const response = await fetch('http://localhost:5000/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId,
          title: 'Omnirelay Chat'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }

  /**
   * Call existing Omari chat API
   */
  private static async callOmariChat(request: any): Promise<any> {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Chat API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to call Omari chat API:', error);
      throw error;
    }
  }

  /**
   * Generate task suggestions based on user input
   */
  static async generateTaskSuggestions(
    deviceId: string,
    userMessage: string,
    context?: Context
  ): Promise<string[]> {
    try {
      // This would integrate with the existing OpenAI service
      // For now, return some default suggestions
      return [
        'Create a memory block for this topic',
        'Set up an integration for this workflow',
        'Schedule a follow-up reminder',
        'Export this conversation'
      ];
    } catch (error) {
      console.error('Failed to generate task suggestions:', error);
      return [];
    }
  }

  /**
   * Get conversation history with context
   */
  static async getConversationHistory(
    deviceId: string,
    conversationId: string,
    limit?: number
  ): Promise<any[]> {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${conversationId}?limit=${limit || 10}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get conversation history: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get conversation history:', error);
      return [];
    }
  }

  /**
   * Apply personality context to chat request
   */
  private static applyPersonalityContext(
    request: any,
    context?: Context
  ): any {
    if (!context?.personality) {
      return request;
    }

    // Add personality traits to the request context
    return {
      ...request,
      context: {
        ...request.context,
        personality: context.personality,
        traits: context.traits || [],
        memory_hint: context.memory_hint
      }
    };
  }

  /**
   * Validate chat input
   */
  private static validateChatInput(input: string): void {
    if (!input || input.trim().length === 0) {
      throw new Error('Chat input cannot be empty');
    }

    if (input.length > 10000) {
      throw new Error('Chat input too long (max 10000 characters)');
    }
  }

  /**
   * Process chat with enhanced context
   */
  static async processChatWithContext(
    deviceId: string,
    payload: ChatPayload,
    context?: Context
  ): Promise<any> {
    // Validate input
    this.validateChatInput(payload.input);

    // Apply personality context
    const enhancedPayload = this.applyPersonalityContext(payload, context);

    // Get conversation history for context
    let conversationHistory: any[] = [];
    if (payload.conversation_id) {
      conversationHistory = await this.getConversationHistory(
        deviceId,
        payload.conversation_id,
        5
      );
    }

    // Process the chat with full context
    const result = await this.handleChat(deviceId, enhancedPayload, context);

    // Generate task suggestions
    const suggestions = await this.generateTaskSuggestions(
      deviceId,
      payload.input,
      context
    );

    return {
      ...result,
      suggestions,
      conversation_history: conversationHistory.slice(-3) // Last 3 messages for context
    };
  }
}
