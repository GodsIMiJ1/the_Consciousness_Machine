import { 
  ConversationCreatePayload, 
  ConversationListPayload, 
  ConversationDeletePayload,
  MessageAppendPayload,
  MessageListPayload 
} from '../schemas/envelope.js';
import { emitConversationCreated, emitMessageCreated } from '../handlers/emit.js';

/**
 * Conversation domain handler - integrates with existing Omari conversation system
 */
export class ConversationHandler {
  /**
   * Create new conversation
   */
  static async createConversation(deviceId: string, payload: ConversationCreatePayload): Promise<any> {
    try {
      const { title } = payload;

      const conversationData = {
        deviceId,
        title: title || 'New Conversation'
      };

      const response = await fetch('http://localhost:5000/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conversationData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create conversation: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const conversation = await response.json();

      // Emit conversation created event
      await emitConversationCreated(deviceId, conversation);

      return {
        conversation,
        message: 'Conversation created successfully'
      };
    } catch (error) {
      console.error('Conversation create error:', error);
      throw new Error(`Conversation creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List conversations for device
   */
  static async listConversations(deviceId: string, payload: ConversationListPayload): Promise<any> {
    try {
      const { limit } = payload;

      const response = await fetch(`http://localhost:5000/api/conversations/${deviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list conversations: ${response.status}`);
      }

      let conversations = await response.json();

      // Sort by most recent first
      conversations.sort((a: any, b: any) => 
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );

      // Apply limit if specified
      if (limit && limit > 0) {
        conversations = conversations.slice(0, limit);
      }

      return {
        conversations,
        total_count: conversations.length
      };
    } catch (error) {
      console.error('Conversation list error:', error);
      throw new Error(`Failed to list conversations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete conversation
   */
  static async deleteConversation(deviceId: string, payload: ConversationDeletePayload): Promise<any> {
    try {
      const { id } = payload;

      const response = await fetch(`http://localhost:5000/api/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete conversation: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      return {
        message: 'Conversation deleted successfully',
        deleted_id: id
      };
    } catch (error) {
      console.error('Conversation delete error:', error);
      throw new Error(`Conversation deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Append message to conversation
   */
  static async appendMessage(deviceId: string, payload: MessageAppendPayload): Promise<any> {
    try {
      const { conversation_id, role, content } = payload;

      // Validate role
      const validRoles = ['user', 'assistant', 'system'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid message role: ${role}`);
      }

      // Validate content
      if (!content || content.trim().length === 0) {
        throw new Error('Message content cannot be empty');
      }

      const messageData = {
        conversationId: conversation_id,
        role,
        content: content.trim(),
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'omnirelay'
        }
      };

      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to append message: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const message = await response.json();

      // Emit message created event
      await emitMessageCreated(deviceId, conversation_id, message);

      return {
        message,
        conversation_id,
        message_text: 'Message appended successfully'
      };
    } catch (error) {
      console.error('Message append error:', error);
      throw new Error(`Message append failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List messages in conversation
   */
  static async listMessages(deviceId: string, payload: MessageListPayload): Promise<any> {
    try {
      const { conversation_id, limit } = payload;

      const response = await fetch(`http://localhost:5000/api/messages/${conversation_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list messages: ${response.status}`);
      }

      let messages = await response.json();

      // Sort by creation time (oldest first for conversation flow)
      messages.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Apply limit if specified (take most recent)
      if (limit && limit > 0) {
        messages = messages.slice(-limit);
      }

      return {
        messages,
        conversation_id,
        total_count: messages.length
      };
    } catch (error) {
      console.error('Message list error:', error);
      throw new Error(`Failed to list messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get conversation summary
   */
  static async getConversationSummary(deviceId: string, conversationId: string): Promise<any> {
    try {
      // Get conversation details
      const conversationResponse = await fetch(`http://localhost:5000/api/conversations/${deviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!conversationResponse.ok) {
        throw new Error(`Failed to get conversation: ${conversationResponse.status}`);
      }

      const conversations = await conversationResponse.json();
      const conversation = conversations.find((c: any) => c.id === conversationId);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Get messages
      const messages = await this.listMessages(deviceId, { conversation_id: conversationId });

      // Calculate summary statistics
      const messageCount = messages.messages.length;
      const userMessages = messages.messages.filter((m: any) => m.role === 'user').length;
      const assistantMessages = messages.messages.filter((m: any) => m.role === 'assistant').length;
      const systemMessages = messages.messages.filter((m: any) => m.role === 'system').length;

      const firstMessage = messages.messages[0];
      const lastMessage = messages.messages[messages.messages.length - 1];

      return {
        conversation,
        statistics: {
          total_messages: messageCount,
          user_messages: userMessages,
          assistant_messages: assistantMessages,
          system_messages: systemMessages,
          first_message_at: firstMessage?.createdAt,
          last_message_at: lastMessage?.createdAt
        },
        recent_messages: messages.messages.slice(-3) // Last 3 messages
      };
    } catch (error) {
      console.error('Conversation summary error:', error);
      throw new Error(`Failed to get conversation summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update conversation title
   */
  static async updateConversationTitle(deviceId: string, conversationId: string, title: string): Promise<any> {
    try {
      // This would need to be implemented in the main Omari API
      // For now, we'll return a placeholder response
      return {
        conversation_id: conversationId,
        title,
        message: 'Title update not yet implemented in main API'
      };
    } catch (error) {
      console.error('Conversation title update error:', error);
      throw new Error(`Failed to update conversation title: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export conversation
   */
  static async exportConversation(deviceId: string, conversationId: string, format: 'json' | 'text' = 'json'): Promise<any> {
    try {
      const summary = await this.getConversationSummary(deviceId, conversationId);
      
      if (format === 'text') {
        // Convert to readable text format
        let textExport = `Conversation: ${summary.conversation.title || 'Untitled'}\n`;
        textExport += `Created: ${summary.conversation.createdAt}\n`;
        textExport += `Messages: ${summary.statistics.total_messages}\n\n`;

        for (const message of summary.recent_messages) {
          textExport += `[${message.role.toUpperCase()}] ${message.content}\n\n`;
        }

        return {
          format: 'text',
          content: textExport,
          conversation_id: conversationId
        };
      }

      // Return JSON format
      return {
        format: 'json',
        content: summary,
        conversation_id: conversationId
      };
    } catch (error) {
      console.error('Conversation export error:', error);
      throw new Error(`Failed to export conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
