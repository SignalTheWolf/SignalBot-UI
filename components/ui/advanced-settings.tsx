import { FC, useEffect, useState, useContext } from "react"
import { supabase } from "@/lib/supabase/browser-client" //Supabase location
import { ChatbotUIContext } from "@/context/context" // The user context needed to view the database in Supabase
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"

interface AdvancedSettingsProps {
  children: React.ReactNode
}

interface Profile {
  isAdmin: boolean;
}

export const AdvancedSettings: FC<AdvancedSettingsProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { profile } = useContext(ChatbotUIContext)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (profile) {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('isAdmin')
          .eq('id', profile.id)
          .single()

        if (error) {
          console.error('Error fetching user role:', error.message)
        } else if (data && 'isAdmin' in data) {
          setIsAdmin((data as Profile).isAdmin)
        } else {
          console.error('Error: isAdmin property is missing in the returned data.')
        }
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [profile])

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
