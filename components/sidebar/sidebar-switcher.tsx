import { ContentType } from "@/types"
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBooks,
  IconFile,
  IconMessage,
  IconPencil,
  IconRobotFace,
  IconSparkles
} from "@tabler/icons-react"
import { FC, useEffect, useState, useContext } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { supabase } from "@/lib/supabase/browser-client" // path to Supabase client
import { ChatbotUIContext } from "@/context/context" // The user context needed to view the database in Supabase

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  const [hasAdmin, setHasAdmin] = useState(false)
  const { profile } = useContext(ChatbotUIContext)

  useEffect(() => {
    const fetchUserAdmin = async () => {
      if (profile) {
        const { data, error } = await supabase
          .from('profiles') // Table in the 'public' schema 
          .select('Is_Admin') // Column in the 'profiles' table
          .eq('id', profile.id)
          .single()

        if (error) {
          console.error('Error fetching user role:', error.message)
        } else if (data) {
          // Check if the Is_Admin field is TRUE (boolean true)
          setHasAdmin(data.Is_Admin === true)
        }
      }
    }

    fetchUserAdmin()
  }, [profile])

  return (
    <div className="flex flex-col justify-between border-r-2 pb-5">
      <TabsList className="bg-background grid h-[440px] grid-rows-7">
        <SidebarSwitchItem
          icon={<IconMessage size={SIDEBAR_ICON_SIZE} />}
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
          contentType="files"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconPencil size={SIDEBAR_ICON_SIZE} />}
          contentType="prompts"
          onContentTypeChange={onContentTypeChange}
        />

        {hasAdmin && (
          <>
            <SidebarSwitchItem
              icon={<IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />}
              contentType="presets"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconSparkles size={SIDEBAR_ICON_SIZE} />}
              contentType="models"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconBooks size={SIDEBAR_ICON_SIZE} />}
              contentType="collections"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} />}
              contentType="assistants"
              onContentTypeChange={onContentTypeChange}
            />

            <SidebarSwitchItem
              icon={<IconBolt size={SIDEBAR_ICON_SIZE} />}
              contentType="tools"
              onContentTypeChange={onContentTypeChange}
            />
          </>
        )}
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        <WithTooltip
          display={<div>Profile Settings</div>}
          trigger={<ProfileSettings />}
        />
      </div>
    </div>
  )
}
