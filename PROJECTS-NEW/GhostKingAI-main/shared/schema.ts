import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const devices = pgTable("devices", {
  id: varchar("id").primaryKey(),
  lastActive: timestamp("last_active").defaultNow(),
  settings: json("settings").$type<{
    autoSave: boolean;
    voiceEnabled: boolean;
    integrations: string[];
    memoryLimit: number;
  }>().default({
    autoSave: true,
    voiceEnabled: true,
    integrations: [],
    memoryLimit: 35
  }),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata").$type<{
    timestamp: string;
    integrationData?: any;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").default(true),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  settings: json("settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  permissions: json("permissions").$type<{
    chat: boolean;
    conversations: boolean;
    integrations: boolean;
    webhooks: boolean;
  }>().default({
    chat: true,
    conversations: true,
    integrations: false,
    webhooks: true,
  }),
  isActive: boolean("is_active").default(true),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const memoryBlocks = pgTable("memory_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  importance: integer("importance").notNull().default(5), // 1-10 scale
  category: text("category").default("general"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const personalitySettings = pgTable("personality_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  userInfo: json("user_info").$type<{
    name?: string;
    preferences?: string;
    background?: string;
    goals?: string;
  }>().default({}),
  traits: json("traits").$type<{
    wisdom: boolean;
    humor: boolean;
    formal: boolean;
    creative: boolean;
    analytical: boolean;
    empathetic: boolean;
  }>().default({
    wisdom: true,
    humor: false,
    formal: false,
    creative: true,
    analytical: true,
    empathetic: true,
  }),
  customPrompts: text("custom_prompts").default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  id: true,
  settings: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  deviceId: true,
  title: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
  metadata: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  deviceId: true,
  name: true,
  type: true,
  isActive: true,
  apiEndpoint: true,
  apiKey: true,
  settings: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  deviceId: true,
  name: true,
  permissions: true,
});

export const insertMemoryBlockSchema = createInsertSchema(memoryBlocks).pick({
  deviceId: true,
  title: true,
  content: true,
  importance: true,
  category: true,
  isActive: true,
});

export const insertPersonalitySettingsSchema = createInsertSchema(personalitySettings).pick({
  deviceId: true,
  userInfo: true,
  traits: true,
  customPrompts: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertMemoryBlock = z.infer<typeof insertMemoryBlockSchema>;
export type MemoryBlock = typeof memoryBlocks.$inferSelect;
export type InsertPersonalitySettings = z.infer<typeof insertPersonalitySettingsSchema>;
export type PersonalitySettings = typeof personalitySettings.$inferSelect;

// Omnirelay adapter tables
export const relayIdempotency = pgTable("relay_idempotency", {
  id: varchar("id").primaryKey(),
  bodyHash: text("body_hash").notNull(),
  status: integer("status").notNull(),
  resultHash: text("result_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const relayAudit = pgTable("relay_audit", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestId: varchar("request_id").notNull(),
  op: text("op").notNull(),
  actorDeviceId: varchar("actor_device_id").notNull(),
  status: integer("status").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRelayIdempotencySchema = createInsertSchema(relayIdempotency).pick({
  id: true,
  bodyHash: true,
  status: true,
  resultHash: true,
});

export const insertRelayAuditSchema = createInsertSchema(relayAudit).pick({
  requestId: true,
  op: true,
  actorDeviceId: true,
  status: true,
  latencyMs: true,
});

export type InsertRelayIdempotency = z.infer<typeof insertRelayIdempotencySchema>;
export type RelayIdempotency = typeof relayIdempotency.$inferSelect;
export type InsertRelayAudit = z.infer<typeof insertRelayAuditSchema>;
export type RelayAudit = typeof relayAudit.$inferSelect;
