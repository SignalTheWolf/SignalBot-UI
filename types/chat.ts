import { Tables } from "@/supabase/types"
import { ChatMessage, LLMID } from "."

// Existing Interfaces
export interface ChatSettings {
  model: LLMID
  prompt: string
  temperature: number
  contextLength: number
  includeProfileContext: boolean
  includeWorkspaceInstructions: boolean
  embeddingsProvider: "openai" | "local"
}

export interface ChatPayload {
  chatSettings: ChatSettings
  workspaceInstructions: string
  chatMessages: ChatMessage[]
  assistant: Tables<"assistants"> | null
  messageFileItems: Tables<"file_items">[]
  chatFileItems: Tables<"file_items">[]
}

export interface ChatAPIPayload {
  chatSettings: ChatSettings
  messages: Tables<"messages">[]
}

// New Chat Interface
export interface Chat {
  id: string
  user_id: string
  workspace_id: string
  assistant_id: string
  folder_id: string
  created_at: string
  updated_at: string
  sharing: string
  context_length: number
  embeddings_provider: string
  include_profile_context: boolean
  include_workspace_instructions: boolean
  model: string
  name: string
  prompt: string
  temperature: number
}
