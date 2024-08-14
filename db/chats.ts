import { supabase } from "@/lib/supabase/browser-client"
import { Chat, TablesInsert, TablesUpdate } from "@/supabase/types"

export const getChatById = async (chatId: string) => {
  const { data: chat } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .maybeSingle()

  return chat
}

export const getChatsByWorkspaceId = async (workspaceId: string) => {
  const { data: chats, error } = await supabase
    .from("chats")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (!chats) {
    throw new Error(error.message)
  }

  return chats
}

export const createChat = async (chat: TablesInsert<"chats">) => {
  const { data: createdChat, error } = await supabase
    .from("chats")
    .insert([chat])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdChat
}

export const createChats = async (chats: TablesInsert<"chats">[]) => {
  const { data: createdChats, error } = await supabase
    .from("chats")
    .insert(chats)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  return createdChats
}

export const updateChat = async (
  chatId: string,
  chat: TablesUpdate<"chats">
) => {
  const { data: updatedChat, error } = await supabase
    .from("chats")
    .update(chat)
    .eq("id", chatId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedChat
}

export const deleteChat = async (chatId: string) => {
  const { error } = await supabase.from("chats").delete().eq("id", chatId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}


//Added new archiveChat function
export const archiveChat = async (chat: Chat): Promise<void> => {
  try {
    const { error } = await supabase.from("archived_chats").insert({
      original_chat_id: chat.id,
      user_id: chat.user_id,
      workspace_id: chat.workspace_id,
      assistant_id: chat.assistant_id,
      folder_id: chat.folder_id,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      sharing: chat.sharing,
      context_length: chat.context_length,
      embeddings_provider: chat.embeddings_provider,
      include_profile_context: chat.include_profile_context,
      include_workspace_instructions: chat.include_workspace_instructions,
      model: chat.model,
      name: chat.name,
      prompt: chat.prompt,
      temperature: chat.temperature,
    })

    if (error) {
      console.error(`Failed to archive chat with id ${chat.id}:`, error)
      throw new Error(`Failed to archive chat with id ${chat.id}`)
    }
  } catch (error) {
    console.error("Error archiving chat:", error)
    throw error
  }
}
