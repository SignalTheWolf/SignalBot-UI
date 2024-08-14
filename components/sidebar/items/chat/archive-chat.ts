import { supabase } from "@/utils/supabaseClient";

// Function to archive a single chat
export const archiveChat = async (chat: Chat): Promise<void> => {
  try {
    const { error } = await supabase.from('archived_chats').insert({
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
      temperature: chat.temperature
    });

    if (error) {
      console.error(`Failed to archive chat with id ${chat.id}:`, error);
      throw new Error(`Failed to archive chat with id ${chat.id}`);
    }

  } catch (error) {
    console.error('Error archiving chat:', error);
    throw error;
  }
};
