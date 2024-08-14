import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChatbotUIContext } from "@/context/context";
import { deleteChat } from "@/db/chats";
import useHotkey from "@/lib/hooks/use-hotkey";
import { Tables } from "@/supabase/types";
import { IconTrash } from "@tabler/icons-react";
import { FC, useContext, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/browser-client";

interface DeleteChatProps {
  chat: Tables<"chats">;
}

export const DeleteChat: FC<DeleteChatProps> = ({ chat }) => {
  useHotkey("Backspace", () => setShowChatDialog(true));

  const { setChats } = useContext(ChatbotUIContext);
  const { handleNewChat } = useChatHandler();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);

  const handleArchiveChat = async () => {
    try {
      const archiveData = {
        chat_id: chat.id,
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
      };

      console.log("Archiving data to archived_chats:", archiveData);

      const { error } = await supabase.from("archived_chats").insert(archiveData);

      if (error) {
        console.error(`Failed to archive chat with id ${chat.id}:`, error);
        throw new Error(`Failed to archive chat with id ${chat.id}`);
      }

      console.log(`Successfully archived chat with id ${chat.id} to archived_chats.`);
    } catch (archiveError) {
      console.error(`Error archiving chat with id ${chat.id}:`, archiveError);
      throw archiveError;
    }
  };

  const handleDeleteChat = async () => {
    try {
      // Archive chat first
      await handleArchiveChat();

      // Delete chat from the original table
      const { error } = await supabase.from("chats").delete().eq("id", chat.id);

      if (error) {
        console.error(`Failed to delete chat with id ${chat.id}:`, error);
        throw new Error(`Failed to delete chat with id ${chat.id}`);
      }

      console.log(`Successfully deleted chat with id ${chat.id} from chats.`);

      // Update state
      setChats(prevState => prevState.filter(c => c.id !== chat.id));

      // Close the dialog
      setShowChatDialog(false);

      // Start a new chat session
      handleNewChat();
    } catch (error) {
      console.error("Error archiving or deleting chat:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click();
    }
  };

  return (
    <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
      <DialogTrigger asChild>
        <IconTrash className="hover:opacity-50" size={18} />
      </DialogTrigger>

      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Delete {chat.name}</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete this chat?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowChatDialog(false)}>
            Cancel
          </Button>

          <Button
            ref={buttonRef}
            variant="destructive"
            onClick={handleDeleteChat}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
