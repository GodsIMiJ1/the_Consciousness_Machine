import { z } from 'zod';

export const ActorSchema = z.object({
  device_id: z.string(),
  persona: z.string().optional(),
  scopes: z.array(z.string()).optional()
});

export const TraceSchema = z.object({
  request_id: z.string().optional(),
  parent_id: z.string().optional()
}).passthrough();

export const ContextSchema = z.object({
  personality: z.object({
    wisdom: z.boolean().optional(),
    humor: z.boolean().optional(),
    creative: z.boolean().optional(),
    analytical: z.boolean().optional(),
    empathetic: z.boolean().optional(),
    formal: z.boolean().optional()
  }).optional(),
  traits: z.array(z.string()).optional(),
  memory_hint: z.string().optional()
}).passthrough();

export const EnvelopeSchema = z.object({
  v: z.literal("1.0"),
  id: z.string().uuid(),
  ts: z.string().datetime(),
  source: z.string(),
  target: z.string(),
  op: z.string(),
  actor: ActorSchema,
  context: ContextSchema.optional(),
  payload: z.record(z.any()),
  trace: TraceSchema.optional()
});

// Operation-specific payload schemas
export const ChatPayloadSchema = z.object({
  input: z.string(),
  conversation_id: z.string().optional(),
  tools: z.array(z.string()).optional()
});

export const MemoryQueryPayloadSchema = z.object({
  filter: z.object({
    category: z.string().optional(),
    min_importance: z.number().min(1).max(10).optional(),
    active_only: z.boolean().optional()
  }).optional(),
  limit: z.number().positive().optional()
});

export const MemoryAddPayloadSchema = z.object({
  content: z.string().max(8000),
  category: z.string(),
  importance: z.number().min(1).max(10),
  active: z.boolean().optional().default(true)
});

export const MemoryUpdatePayloadSchema = z.object({
  id: z.string(),
  content: z.string().max(8000).optional(),
  importance: z.number().min(1).max(10).optional(),
  active: z.boolean().optional()
});

export const MemoryDeletePayloadSchema = z.object({
  id: z.string()
});

export const PersonalitySetPayloadSchema = z.object({
  updates: z.object({
    wisdom: z.boolean().optional(),
    humor: z.boolean().optional(),
    creative: z.boolean().optional(),
    analytical: z.boolean().optional(),
    empathetic: z.boolean().optional(),
    formal: z.boolean().optional(),
    custom_instructions: z.string().optional()
  })
});

export const IntegrationInvokePayloadSchema = z.object({
  provider: z.enum(["github", "notion", "gmail", "netlify", "gdocs", "vscode", "custom"]),
  action: z.string(),
  params: z.record(z.any())
});

export const ConversationCreatePayloadSchema = z.object({
  title: z.string().optional()
});

export const ConversationListPayloadSchema = z.object({
  limit: z.number().positive().optional()
});

export const ConversationDeletePayloadSchema = z.object({
  id: z.string()
});

export const MessageAppendPayloadSchema = z.object({
  conversation_id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string()
});

export const MessageListPayloadSchema = z.object({
  conversation_id: z.string(),
  limit: z.number().positive().optional()
});

// Type exports
export type Envelope = z.infer<typeof EnvelopeSchema>;
export type Actor = z.infer<typeof ActorSchema>;
export type Context = z.infer<typeof ContextSchema>;
export type Trace = z.infer<typeof TraceSchema>;

export type ChatPayload = z.infer<typeof ChatPayloadSchema>;
export type MemoryQueryPayload = z.infer<typeof MemoryQueryPayloadSchema>;
export type MemoryAddPayload = z.infer<typeof MemoryAddPayloadSchema>;
export type MemoryUpdatePayload = z.infer<typeof MemoryUpdatePayloadSchema>;
export type MemoryDeletePayload = z.infer<typeof MemoryDeletePayloadSchema>;
export type PersonalitySetPayload = z.infer<typeof PersonalitySetPayloadSchema>;
export type IntegrationInvokePayload = z.infer<typeof IntegrationInvokePayloadSchema>;
export type ConversationCreatePayload = z.infer<typeof ConversationCreatePayloadSchema>;
export type ConversationListPayload = z.infer<typeof ConversationListPayloadSchema>;
export type ConversationDeletePayload = z.infer<typeof ConversationDeletePayloadSchema>;
export type MessageAppendPayload = z.infer<typeof MessageAppendPayloadSchema>;
export type MessageListPayload = z.infer<typeof MessageListPayloadSchema>;

// Operation type mapping
export const OPERATION_SCHEMAS = {
  'omari.chat': ChatPayloadSchema,
  'memory.query': MemoryQueryPayloadSchema,
  'memory.add': MemoryAddPayloadSchema,
  'memory.update': MemoryUpdatePayloadSchema,
  'memory.delete': MemoryDeletePayloadSchema,
  'personality.get': z.object({}),
  'personality.set': PersonalitySetPayloadSchema,
  'integration.invoke': IntegrationInvokePayloadSchema,
  'device.get_settings': z.object({}),
  'conversation.create': ConversationCreatePayloadSchema,
  'conversation.list': ConversationListPayloadSchema,
  'conversation.delete': ConversationDeletePayloadSchema,
  'message.append': MessageAppendPayloadSchema,
  'message.list': MessageListPayloadSchema
} as const;

export type OperationType = keyof typeof OPERATION_SCHEMAS;
