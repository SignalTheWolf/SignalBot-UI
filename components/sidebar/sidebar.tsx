import { ChatbotUIContext } from "@/context/context";
import { Tables } from "@/supabase/types";
import { ContentType } from "@/types";
import { FC, useContext, useEffect, useState } from "react";
import { SIDEBAR_WIDTH } from "../ui/dashboard";
import { TabsContent } from "../ui/tabs";
import { WorkspaceSwitcher } from "../utility/workspace-switcher";
import { WorkspaceSettings } from "../workspace/workspace-settings";
import { SidebarContent } from "./sidebar-content";
import { supabase } from "@/lib/supabase/browser-client" // path to Supabase client

interface ProfileData {
  isAdmin: boolean;
  kioskApp: boolean;
}

interface SidebarProps {
  contentType: ContentType;
  showSidebar: boolean;
}

export const Sidebar: FC<SidebarProps> = ({ contentType, showSidebar }) => {
  const {
    folders,
    chats,
    presets,
    prompts,
    files,
    collections,
    assistants,
    tools,
    models,
    profile, // Ensure profile is included in context
  } = useContext(ChatbotUIContext);

  const chatFolders = folders.filter((folder) => folder.type === "chats");
  const presetFolders = folders.filter((folder) => folder.type === "presets");
  const promptFolders = folders.filter((folder) => folder.type === "prompts");
  const filesFolders = folders.filter((folder) => folder.type === "files");
  const collectionFolders = folders.filter(
    (folder) => folder.type === "collections"
  );
  const assistantFolders = folders.filter(
    (folder) => folder.type === "assistants"
  );
  const toolFolders = folders.filter((folder) => folder.type === "tools");
  const modelFolders = folders.filter((folder) => folder.type === "models");

  const renderSidebarContent = (
    contentType: ContentType,
    data: any[],
    folders: Tables<"folders">[]
  ) => {
    return (
      <SidebarContent contentType={contentType} data={data} folders={folders} />
    );
  };

  const [isAdmin, setIsAdmin] = useState(false);
  const [kioskApp, setIsKioskApp] = useState(false);

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
    <TabsContent
      className="m-0 w-full space-y-2"
      style={{
        minWidth: showSidebar ? `calc(${SIDEBAR_WIDTH}px - 60px)` : "0px",
        maxWidth: showSidebar ? `calc(${SIDEBAR_WIDTH}px - 60px)` : "0px",
        width: showSidebar ? `calc(${SIDEBAR_WIDTH}px - 60px)` : "0px",
      }}
      value={contentType}
    >
      <div className="flex h-full flex-col p-3">
        {!kioskApp && (
          <div className="flex items-center border-b-2 pb-2">
            <WorkspaceSwitcher />
            <WorkspaceSettings />
          </div>
        )}

        <div className="flex-grow">
          {(() => {
            switch (contentType) {
              case "chats":
                return renderSidebarContent("chats", chats, chatFolders);
              case "presets":
                return renderSidebarContent("presets", presets, presetFolders);
              case "prompts":
                return renderSidebarContent("prompts", prompts, promptFolders);
              case "files":
                return renderSidebarContent("files", files, filesFolders);
              case "collections":
                return renderSidebarContent(
                  "collections",
                  collections,
                  collectionFolders
                );
              case "assistants":
                return renderSidebarContent(
                  "assistants",
                  assistants,
                  assistantFolders
                );
              case "tools":
                return renderSidebarContent("tools", tools, toolFolders);
              case "models":
                return renderSidebarContent("models", models, modelFolders);
              default:
                return null;
            }
          })()}
        </div>
      </div>
    </TabsContent>
  );
};
