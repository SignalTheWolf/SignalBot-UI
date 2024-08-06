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
import { IconTrash } from "@tabler/icons-react";
import { FC, useContext, useRef, useState } from "react";

export const DeleteAllChats: FC = () => {
  const { setChats, chats } = useContext(ChatbotUIContext);
  const { handleNewChat } = useChatHandler();
  
  const [showDialog, setShowDialog] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleDeleteAllChats = async () => {
    const deletePromises = chats.map((chat) => deleteChat(chat.id));
    await Promise.all(deletePromises);
    
    setChats([]);
    
    setShowDialog(false);
    
    handleNewChat();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click();
    }
  };
  
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
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
