import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { insertDeviceSchema, insertConversationSchema, insertMessageSchema, insertIntegrationSchema, insertMemoryBlockSchema, insertPersonalitySettingsSchema } from "@shared/schema";
import { IntegrationManager, INTEGRATION_TEMPLATES } from "./services/integrations";
import { setupExternalRoutes } from "./routes/external";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// Rate limiting for AI requests
const aiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per windowMs
  message: { error: "Too many AI requests, please try again later." }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Device management
  app.get("/api/device/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      let device = await storage.getDevice(deviceId);
      
      if (!device) {
        device = await storage.createOrUpdateDevice({ 
          id: deviceId,
          settings: {
            autoSave: true,
            voiceEnabled: true,
            integrations: [],
            memoryLimit: 35
          }
        });
      }
      
      res.json(device);
    } catch (error) {
      res.status(500).json({ error: "Failed to get device" });
    }
  });

  app.put("/api/device/:deviceId/settings", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { settings } = req.body;
      
      const device = await storage.updateDeviceSettings(deviceId, settings);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      res.status(500).json({ error: "Failed to update device settings" });
    }
  });

  // Conversation management
  app.get("/api/conversations/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const conversations = await storage.getConversationsByDevice(deviceId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid conversation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.delete("/api/conversations/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const deleted = await storage.deleteConversation(conversationId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Message management
  app.get("/api/messages/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await storage.getMessagesByConversation(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // AI Chat endpoint
  app.post("/api/chat", aiRateLimit, async (req, res) => {
    try {
      const { conversationId, message, deviceId } = req.body;
      
      if (!conversationId || !message || !deviceId) {
        return res.status(400).json({ error: "Missing required fields: conversationId, message, deviceId" });
      }

      // Create user message
      const userMessage = await storage.createMessage({
        conversationId,
        role: "user",
        content: message,
        metadata: { timestamp: new Date().toISOString() }
      });

      // Get conversation history for context
      const messages = await storage.getMessagesByConversation(conversationId);
      const chatHistory = messages.slice(-10).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      // Get device for context
      const device = await storage.getDevice(deviceId);
      const integrations = await storage.getIntegrationsByDevice(deviceId);

      // Generate AI response
      const aiResponse = await openaiService.generateResponse({
        messages: chatHistory,
        deviceId,
        context: {
          deviceSettings: device?.settings,
          activeIntegrations: integrations.filter(i => i.isActive).map(i => i.name)
        }
      });

      // Create AI message
      const assistantMessage = await storage.createMessage({
        conversationId,
        role: "assistant",
        content: aiResponse.content,
        metadata: { 
          timestamp: new Date().toISOString(),
          usage: aiResponse.usage
        }
      });

      // Update conversation title if it's the first exchange
      if (messages.length <= 2) {
        const title = await openaiService.generateConversationTitle([
          { role: "user", content: message },
          { role: "assistant", content: aiResponse.content }
        ]);
        await storage.updateConversationTitle(conversationId, title);
      }

      res.json({ 
        userMessage, 
        assistantMessage,
        usage: aiResponse.usage
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Integration management
  app.get("/api/integrations/templates", async (req, res) => {
    try {
      res.json(INTEGRATION_TEMPLATES);
    } catch (error) {
      res.status(500).json({ error: "Failed to get integration templates" });
    }
  });

  app.get("/api/integrations/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const integrations = await storage.getIntegrationsByDevice(deviceId);
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get integrations" });
    }
  });

  app.post("/api/integrations", async (req, res) => {
    try {
      const validatedData = insertIntegrationSchema.parse(req.body);
      const integration = await storage.createIntegration(validatedData);
      res.json(integration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid integration data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create integration" });
    }
  });

  app.put("/api/integrations/:integrationId", async (req, res) => {
    try {
      const { integrationId } = req.params;
      const updates = req.body;
      
      const integration = await storage.updateIntegration(integrationId, updates);
      if (!integration) {
        return res.status(404).json({ error: "Integration not found" });
      }
      
      res.json(integration);
    } catch (error) {
      res.status(500).json({ error: "Failed to update integration" });
    }
  });

  app.delete("/api/integrations/:integrationId", async (req, res) => {
    try {
      const { integrationId } = req.params;
      const deleted = await storage.deleteIntegration(integrationId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Integration not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete integration" });
    }
  });

  // Test integration connection
  app.post("/api/integrations/test", async (req, res) => {
    try {
      const { type, config } = req.body;
      
      if (!type || !config) {
        return res.status(400).json({ error: "Missing type or config" });
      }

      const result = await IntegrationManager.testIntegration(type, config);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to test integration" });
    }
  });

  // Integration operations
  app.post("/api/integrations/:integrationId/execute", async (req, res) => {
    try {
      const { integrationId } = req.params;
      const { operation, params } = req.body;
      
      const integration = await storage.getIntegration(integrationId);
      if (!integration) {
        return res.status(404).json({ error: "Integration not found" });
      }

      const service = IntegrationManager.createIntegration(integration.type, integration.settings);
      
      let result;
      switch (operation) {
        case 'github.repositories':
          result = await (service as any).getRepositories();
          break;
        case 'github.issues':
          result = await (service as any).getIssues(params.repo);
          break;
        case 'github.pullRequests':
          result = await (service as any).getPullRequests(params.repo);
          break;
        case 'notion.databases':
          result = await (service as any).getDatabases();
          break;
        case 'notion.pages':
          result = await (service as any).getPages(params.databaseId);
          break;
        case 'gmail.messages':
          result = await (service as any).getMessages(params.maxResults, params.query);
          break;
        case 'netlify.sites':
          result = await (service as any).getSites();
          break;
        case 'netlify.deployments':
          result = await (service as any).getDeployments(params.siteId);
          break;
        default:
          return res.status(400).json({ error: "Operation not supported" });
      }
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to execute integration operation",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // External API endpoints for other apps
  app.post("/api/external/notify", async (req, res) => {
    try {
      const { deviceId, message, type, data } = req.body;
      
      if (!deviceId || !message) {
        return res.status(400).json({ error: "Missing required fields: deviceId, message" });
      }

      // Find the current conversation or create a new one
      const conversations = await storage.getConversationsByDevice(deviceId);
      let conversation = conversations[0];
      
      if (!conversation) {
        conversation = await storage.createConversation({
          deviceId,
          title: "External Notification"
        });
      }

      // Create system message for the external notification
      await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: `📱 ${type ? `[${type}] ` : ''}${message}`,
        metadata: { 
          timestamp: new Date().toISOString(),
          integrationData: data,
          source: "external"
        }
      });

      res.json({ success: true, conversationId: conversation.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to process external notification" });
    }
  });

  app.post("/api/external/query", async (req, res) => {
    try {
      const { deviceId, query, appName } = req.body;
      
      if (!deviceId || !query) {
        return res.status(400).json({ error: "Missing required fields: deviceId, query" });
      }

      // Generate AI response for external query
      const aiResponse = await openaiService.generateResponse({
        messages: [{ role: "user", content: query }],
        deviceId,
        context: { externalApp: appName }
      });

      res.json({ response: aiResponse.content });
    } catch (error) {
      res.status(500).json({ error: "Failed to process external query" });
    }
  });

  // Memory Block management
  app.get("/api/memory/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const memoryBlocks = await storage.getMemoryBlocksByDevice(deviceId);
      res.json(memoryBlocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to get memory blocks" });
    }
  });

  app.post("/api/memory", async (req, res) => {
    try {
      const validatedData = insertMemoryBlockSchema.parse(req.body);
      
      // Check memory limit
      const device = await storage.getDevice(validatedData.deviceId);
      const existingBlocks = await storage.getMemoryBlocksByDevice(validatedData.deviceId);
      const memoryLimit = device?.settings?.memoryLimit || 35;
      
      if (existingBlocks.length >= memoryLimit) {
        return res.status(400).json({ error: `Memory limit of ${memoryLimit} blocks reached` });
      }
      
      const memoryBlock = await storage.createMemoryBlock(validatedData);
      res.json(memoryBlock);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid memory block data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create memory block" });
    }
  });

  app.put("/api/memory/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const memoryBlock = await storage.updateMemoryBlock(id, updates);
      
      if (!memoryBlock) {
        return res.status(404).json({ error: "Memory block not found" });
      }
      
      res.json(memoryBlock);
    } catch (error) {
      res.status(500).json({ error: "Failed to update memory block" });
    }
  });

  app.delete("/api/memory/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMemoryBlock(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Memory block not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete memory block" });
    }
  });

  // Personality Settings management
  app.get("/api/personality/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const personalitySettings = await storage.getPersonalitySettings(deviceId);
      res.json(personalitySettings || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get personality settings" });
    }
  });

  app.put("/api/personality/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const validatedData = insertPersonalitySettingsSchema.parse({
        ...req.body,
        deviceId
      });
      
      const personalitySettings = await storage.createOrUpdatePersonalitySettings(validatedData);
      res.json(personalitySettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid personality settings data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update personality settings" });
    }
  });

  // Export chat history
  app.get("/api/export/:deviceId", async (req, res) => {
    try {
      const { deviceId } = req.params;
      const conversations = await storage.getConversationsByDevice(deviceId);
      
      const exportData = {
        deviceId,
        exportDate: new Date().toISOString(),
        conversations: await Promise.all(
          conversations.map(async (conv) => ({
            ...conv,
            messages: await storage.getMessagesByConversation(conv.id)
          }))
        )
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="omari-chat-${deviceId}-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export chat history" });
    }
  });

  // Setup external API routes
  setupExternalRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
