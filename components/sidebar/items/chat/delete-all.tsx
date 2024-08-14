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
import { deleteChat } from "@/db/chats"; // No need to import archiveChat if we're using custom logic
import { FC, useContext, useRef, useState } from "react";
import { Chat } from "@/types/chat";
import { supabase } from "@/lib/supabase/browser-client";

interface DeleteAllChatsProps {
  className?: string;
}

export const DeleteAllChats: FC<DeleteAllChatsProps> = ({ className }) => {
  const { setChats, chats } = useContext(ChatbotUIContext);
  const { handleNewChat } = useChatHandler();

  const [showDialog, setShowDialog] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDeleteAllChats = async () => {
    try {
      // Archive all chats before deleting
      const archivePromises = chats.map(async (chat) => {
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
          });
          
          if (error) {
            console.error(`Failed to archive chat with id ${chat.id}:`, error);
            throw new Error(`Failed to archive chat with id ${chat.id}`);
          }
        } catch (archiveError) {
          console.error(`Error archiving chat with id ${chat.id}:`, archiveError);
          throw archiveError;
        }
      });

      await Promise.all(archivePromises);

      console.log("All chats archived successfully.");

      // Delete all chats from the original table
      const deletePromises = chats.map(async (chat) => {
        try {
          const { error } = await supabase.from("chats").delete().eq("id", chat.id);
          if (error) {
            console.error(`Failed to delete chat with id ${chat.id}:`, error);
            throw new Error(`Failed to delete chat with id ${chat.id}`);
          }
        } catch (deleteError) {
          console.error(`Error deleting chat with id ${chat.id}:`, deleteError);
          throw deleteError;
        }
      });

      await Promise.all(deletePromises);

      console.log("All chats deleted successfully.");

      // Clear chats from state
      setChats([]);

      // Close the dialog
      setShowDialog(false);

      // Start a new chat session
      handleNewChat();
    } catch (error) {
      console.error("Error archiving or deleting chats:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click();
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className={`w-full mt-auto px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 ${className}`}
        >
          Delete All Chats
        </Button>
      </DialogTrigger>

      <DialogContent onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Delete All Chats</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete all chats? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>

          <Button
            ref={buttonRef}
            variant="destructive"
            onClick={handleDeleteAllChats}
          >
            Delete All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
