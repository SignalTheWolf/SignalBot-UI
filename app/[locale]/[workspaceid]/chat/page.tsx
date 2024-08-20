"use client"

import { ChatHelp } from "@/components/chat/chat-help"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatSettings } from "@/components/chat/chat-settings"
import { ChatUI } from "@/components/chat/chat-ui"
import { QuickSettings } from "@/components/chat/quick-settings"
import { Brand } from "@/components/ui/brand"
import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useTheme } from "next-themes"
import { useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser-client" // path to Supabase client

interface ProfileData {
  isAdmin: boolean;
  kioskApp: boolean;
}

export default function ChatPage() {
  useHotkey("o", () => handleNewChat())
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const { chatMessages } = useContext(ChatbotUIContext)

  const { handleNewChat, handleFocusChatInput } = useChatHandler()

  const { theme } = useTheme()

  const [isAdmin, setIsAdmin] = useState(false);
  const [kioskApp, setIsKioskApp] = useState(false);
  const [profile] = useContext(ChatbotUIContext);

  useEffect(() => {
    const fetchProfileStatus = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("isAdmin, kioskApp")
        .eq("id", profile.id)
        .single();

      const profileData: ProfileData | null = data as ProfileData | null;

      if (error) {
        console.error("Error fetching profile status:", error);
        return;
      }

      setIsAdmin(profileData?.isAdmin || false);
      setIsKioskApp(profileData?.kioskApp || false);
    };

    fetchProfileStatus();
  }, [profile?.id]);

  return (
    <>
      {chatMessages.length === 0 ? (
        <div className="relative flex h-full flex-col items-center justify-center">
          <div className="top-50% left-50% -translate-x-50% -translate-y-50% absolute mb-20">
            <Brand theme={theme === "dark" ? "dark" : "light"} />
          </div>

          {kioskApp ? null: (
          <div className="absolute left-2 top-2">
            <QuickSettings />
          </div>
          )}

          {kioskApp ? null: (
          <div className="absolute right-2 top-2">
            <ChatSettings />
          </div>
          )}

          <div className="flex grow flex-col items-center justify-center" />

          <div className="w-full min-w-[300px] items-end px-2 pb-3 pt-0 sm:w-[600px] sm:pb-8 sm:pt-5 md:w-[700px] lg:w-[700px] xl:w-[800px]">
            <ChatInput />
          </div>

          <div className="absolute bottom-2 right-2 hidden md:block lg:bottom-4 lg:right-4">
            <ChatHelp />
          </div>
        </div>
      ) : (
        <ChatUI />
      )}
    </>
  )
}
