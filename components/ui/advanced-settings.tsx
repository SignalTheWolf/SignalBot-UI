import { FC, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser-client" // Adjust the import based on your file structure
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"

interface AdvancedSettingsProps {
  children: React.ReactNode
}

export const AdvancedSettings: FC<AdvancedSettingsProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = supabase.auth.user()
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("isAdmin")
            .eq("id", user.id)
            .single()

          if (error) {
            throw error
          }

          setIsAdmin(data.isAdmin)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen)
    // localStorage.setItem("advanced-settings-open", String(isOpen))
  }

  if (loading) {
    return null // or a loading spinner
  }

  if (!isAdmin) {
    return null
  }

  return (
    <Collapsible className="pt-2" open={isOpen} onOpenChange={handleOpenChange}>
      <CollapsibleTrigger className="hover:opacity-50">
        <div className="flex items-center font-bold">
          <div className="mr-1">Advanced Settings</div>
          {isOpen ? (
            <IconChevronDown size={20} stroke={3} />
          ) : (
            <IconChevronRight size={20} stroke={3} />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4">{children}</CollapsibleContent>
    </Collapsible>
  )
}
