import { z } from "zod";

export const chatRequestSchema = z.object({
  api_key: z.string().trim().min(1, "api_key requerido"),
  message: z.string().trim().min(1, "message requerido").max(2000, "message demasiado largo"),
});

export const chatSuccessSchema = z.object({
  reply: z.string(),
  fallback_url: z.string().url().nullable().optional(),
});

export const chatErrorSchema = z.object({
  error: z.string(),
  fallback_url: z.string().url().nullable().optional(),
});

export const agentSummarySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  api_key: z.string().nullable(),
  is_active: z.boolean(),
  messages_limit: z.number().int().nullable(),
});

export const agentListSchema = z.array(agentSummarySchema);

export const agentRecordSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  is_active: z.boolean(),
  messages_limit: z.number().int().nullable(),
  description: z.string().nullable(),
  prompt_system: z.string().nullable(),
  language: z.string().nullable(),
  fallback_url: z.string().url().nullable(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatSuccessResponse = z.infer<typeof chatSuccessSchema>;
export type ChatErrorResponse = z.infer<typeof chatErrorSchema>;
export type AgentRecord = z.infer<typeof agentRecordSchema>;
export type AgentSummary = z.infer<typeof agentSummarySchema>;
