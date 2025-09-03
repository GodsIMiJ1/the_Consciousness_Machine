import type { Express } from "express";
import { storage } from "../storage";
import { openaiService } from "../services/openai";
import { AuthService } from "../services/auth";
import { insertApiKeySchema } from "@shared/schema";
import { z } from "zod";

// External API routes with API key authentication
export function setupExternalRoutes(app: Express) {
  
  // Create API key for a device
  app.post("/api/external/create-key", async (req, res) => {
    try {
      const { deviceId, name, permissions } = req.body;
      
      if (!deviceId || !name) {
        return res.status(400).json({ error: "Missing deviceId or name" });
      }

      // Verify device exists
      const device = await storage.getDevice(deviceId);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      const apiKeyData = await AuthService.createApiKey(deviceId, name, permissions);
      
      res.json({
        id: apiKeyData.id,
        name: apiKeyData.name,
        key: apiKeyData.key, // Only returned once
        permissions: apiKeyData.permissions,
        createdAt: apiKeyData.createdAt
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  // Get API keys for a device
  app.get("/api/external/keys/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      
      // Verify device exists
      const device = await storage.getDevice(deviceId);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      const apiKeys = await storage.getApiKeysByDevice(deviceId);
      
      // Return keys without the hash
      const safeKeys = apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        permissions: key.permissions,
        isActive: key.isActive,
        lastUsed: key.lastUsed,
        createdAt: key.createdAt
      }));
      
      res.json(safeKeys);
    } catch (error) {
      res.status(500).json({ error: "Failed to get API keys" });
    }
  });

  // Delete API key
  app.delete("/api/external/keys/:keyId", async (req, res) => {
    try {
      const { keyId } = req.params;
      
      const deleted = await storage.deleteApiKey(keyId);
      if (!deleted) {
        return res.status(404).json({ error: "API key not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete API key" });
    }
  });

  // Chat endpoint for external systems
  app.post("/api/external/chat", AuthService.apiKeyMiddleware('chat'), async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      const { deviceId } = req.auth;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      let targetConversationId = conversationId;
      
      // If no conversation ID provided, get or create the default one
      if (!targetConversationId) {
        const conversations = await storage.getConversationsByDevice(deviceId);
        if (conversations.length > 0) {
          targetConversationId = conversations[0].id;
        } else {
          const newConversation = await storage.createConversation({
            deviceId,
            title: "External API Chat"
          });
          targetConversationId = newConversation.id;
        }
      }

      // Verify conversation belongs to the device
      const conversation = await storage.getConversation(targetConversationId);
      if (!conversation || conversation.deviceId !== deviceId) {
        return res.status(403).json({ error: "Access denied to conversation" });
      }

      // Store user message
      const userMessage = await storage.createMessage({
        conversationId: targetConversationId,
        role: "user",
        content: message,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "external_api"
        }
      });

      // Get conversation history for context
      const messages = await storage.getMessagesByConversation(targetConversationId);
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get active integrations for context
      const integrations = await storage.getIntegrationsByDevice(deviceId);
      const activeIntegrations = integrations
        .filter(int => int.isActive)
        .map(int => int.name);

      // Generate AI response
      const aiResponse = await openaiService.generateResponse({
        messages: conversationHistory,
        deviceId,
        context: { activeIntegrations }
      });

      // Store assistant message
      const assistantMessage = await storage.createMessage({
        conversationId: targetConversationId,
        role: "assistant",
        content: aiResponse.content,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "external_api",
          usage: aiResponse.usage
        }
      });

      res.json({
        conversationId: targetConversationId,
        response: aiResponse.content,
        messageId: assistantMessage.id,
        usage: aiResponse.usage
      });
    } catch (error) {
      console.error("External chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get conversation history
  app.get("/api/external/conversations/:conversationId", AuthService.apiKeyMiddleware('conversations'), async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { deviceId } = req.auth;

      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.deviceId !== deviceId) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversation(conversationId);
      
      res.json({
        conversation,
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
          source: msg.metadata?.source || 'web'
        }))
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get conversation" });
    }
  });

  // Get device conversations list
  app.get("/api/external/device/conversations", AuthService.apiKeyMiddleware('conversations'), async (req, res) => {
    try {
      const { deviceId } = req.auth;
      const conversations = await storage.getConversationsByDevice(deviceId);
      
      res.json(conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  // Get device status and info
  app.get("/api/external/device/status", AuthService.apiKeyMiddleware(), async (req, res) => {
    try {
      const { deviceId } = req.auth;
      const device = await storage.getDevice(deviceId);
      const conversations = await storage.getConversationsByDevice(deviceId);
      const integrations = await storage.getIntegrationsByDevice(deviceId);
      
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      res.json({
        device: {
          id: device.id,
          settings: device.settings,
          lastActive: device.lastActive
        },
        stats: {
          conversationCount: conversations.length,
          activeIntegrations: integrations.filter(int => int.isActive).length,
          totalIntegrations: integrations.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get device status" });
    }
  });

  // Webhook endpoint for external notifications
  app.post("/api/external/webhook", AuthService.apiKeyMiddleware('webhooks'), async (req, res) => {
    try {
      const { type, data, message } = req.body;
      const { deviceId } = req.auth;

      if (!type || !message) {
        return res.status(400).json({ error: "Missing type or message" });
      }

      // Get or create default conversation
      const conversations = await storage.getConversationsByDevice(deviceId);
      let conversation = conversations[0];
      
      if (!conversation) {
        conversation = await storage.createConversation({
          deviceId,
          title: "Webhook Notifications"
        });
      }

      // Create notification message
      const webhookMessage = `🔔 **${type}**: ${message}${data ? `\n\nData: ${JSON.stringify(data, null, 2)}` : ''}`;
      
      await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: webhookMessage,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "webhook",
          webhookType: type,
          webhookData: data
        }
      });

      res.json({ success: true, message: "Notification received" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // MCP-compatible chat completion endpoint
  app.post("/api/external/mcp/chat/completions", AuthService.apiKeyMiddleware('chat'), async (req, res) => {
    try {
      const { messages, model = "gpt-5", max_tokens, temperature } = req.body;
      const { deviceId } = req.auth;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Get active integrations for context
      const integrations = await storage.getIntegrationsByDevice(deviceId);
      const activeIntegrations = integrations
        .filter(int => int.isActive)
        .map(int => int.name);

      // Generate AI response using OpenAI service
      const aiResponse = await openaiService.generateResponse({
        messages,
        deviceId,
        context: { activeIntegrations },
        model,
        max_tokens,
        temperature
      });

      // Return in OpenAI API format for MCP compatibility
      res.json({
        id: `chatcmpl-${Date.now()}`,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          message: {
            role: "assistant",
            content: aiResponse.content
          },
          finish_reason: "stop"
        }],
        usage: aiResponse.usage
      });
    } catch (error) {
      console.error("MCP chat completion error:", error);
      res.status(500).json({ error: "Failed to generate completion" });
    }
  });

  // List available integrations for external systems
  app.get("/api/external/integrations", AuthService.apiKeyMiddleware('integrations'), async (req, res) => {
    try {
      const { deviceId } = req.auth;
      const integrations = await storage.getIntegrationsByDevice(deviceId);
      
      res.json(integrations.map(int => ({
        id: int.id,
        name: int.name,
        type: int.type,
        isActive: int.isActive,
        capabilities: int.settings?.capabilities || []
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to get integrations" });
    }
  });
}