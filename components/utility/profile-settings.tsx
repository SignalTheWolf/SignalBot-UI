import { ChatbotUIContext } from "@/context/context"
import {
  PROFILE_CONTEXT_MAX,
  PROFILE_DISPLAY_NAME_MAX,
  PROFILE_USERNAME_MAX,
  PROFILE_USERNAME_MIN
} from "@/db/limits"
import { updateProfile } from "@/db/profile"
import { uploadProfileImage } from "@/db/storage/profile-images"
import { exportLocalStorageAsJSON } from "@/lib/export-old-data"
import { fetchOpenRouterModels } from "@/lib/models/fetch-models"
import { LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
import { supabase } from "@/lib/supabase/browser-client"
import { cn } from "@/lib/utils"
import { OpenRouterLLM } from "@/types"
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconFileDownload,
  IconLoader2,
  IconLogout,
  IconUser
} from "@tabler/icons-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FC, useCallback, useContext, useRef, useState, useEffect } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"
import ImagePicker from "../ui/image-picker"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { LimitDisplay } from "../ui/limit-display"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { ThemeSwitcher } from "./theme-switcher"
import { DeleteAllChats } from "../sidebar/items/chat/delete-all"

interface ProfileSettingsProps {}

export const ProfileSettings: FC<ProfileSettingsProps> = ({}) => {
  const {
    profile,
    setProfile,
    envKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels,
    availableOpenRouterModels
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)

  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [usernameAvailable, setUsernameAvailable] = useState(true)
  const [loadingUsername, setLoadingUsername] = useState(false)
  const [profileImageSrc, setProfileImageSrc] = useState(
    profile?.image_url || ""
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileInstructions, setProfileInstructions] = useState(
    profile?.profile_context || ""
  )

  const [useAzureOpenai, setUseAzureOpenai] = useState(
    profile?.use_azure_openai
  )
  const [openaiAPIKey, setOpenaiAPIKey] = useState(
    profile?.openai_api_key || ""
  )
  const [openaiOrgID, setOpenaiOrgID] = useState(
    profile?.openai_organization_id || ""
  )
  const [azureOpenaiAPIKey, setAzureOpenaiAPIKey] = useState(
    profile?.azure_openai_api_key || ""
  )
  const [azureOpenaiEndpoint, setAzureOpenaiEndpoint] = useState(
    profile?.azure_openai_endpoint || ""
  )
  const [azureOpenai35TurboID, setAzureOpenai35TurboID] = useState(
    profile?.azure_openai_35_turbo_id || ""
  )
  const [azureOpenai45TurboID, setAzureOpenai45TurboID] = useState(
    profile?.azure_openai_45_turbo_id || ""
  )
  const [azureOpenai45VisionID, setAzureOpenai45VisionID] = useState(
    profile?.azure_openai_45_vision_id || ""
  )
  const [azureEmbeddingsID, setAzureEmbeddingsID] = useState(
    profile?.azure_openai_embeddings_id || ""
  )
  const [anthropicAPIKey, setAnthropicAPIKey] = useState(
    profile?.anthropic_api_key || ""
  )
  const [googleGeminiAPIKey, setGoogleGeminiAPIKey] = useState(
    profile?.google_gemini_api_key || ""
  )
  const [mistralAPIKey, setMistralAPIKey] = useState(
    profile?.mistral_api_key || ""
  )
  const [groqAPIKey, setGroqAPIKey] = useState(profile?.groq_api_key || "")
  const [perplexityAPIKey, setPerplexityAPIKey] = useState(
    profile?.perplexity_api_key || ""
  )

  const [openrouterAPIKey, setOpenrouterAPIKey] = useState(
    profile?.openrouter_api_key || ""
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
    return
  }

  const handleSave = async () => {
    if (!profile) return
    let profileImageUrl = profile.image_url
    let profileImagePath = ""

    if (profileImageFile) {
      const { path, url } = await uploadProfileImage(profile, profileImageFile)
      profileImageUrl = url ?? profileImageUrl
      profileImagePath = path
    }

    const updatedProfile = await updateProfile(profile.id, {
      ...profile,
      display_name: displayName,
      username,
      profile_context: profileInstructions,
      image_url: profileImageUrl,
      image_path: profileImagePath,
      openai_api_key: openaiAPIKey,
      openai_organization_id: openaiOrgID,
      anthropic_api_key: anthropicAPIKey,
      google_gemini_api_key: googleGeminiAPIKey,
      mistral_api_key: mistralAPIKey,
      groq_api_key: groqAPIKey,
      perplexity_api_key: perplexityAPIKey,
      use_azure_openai: useAzureOpenai,
      azure_openai_api_key: azureOpenaiAPIKey,
      azure_openai_endpoint: azureOpenaiEndpoint,
      azure_openai_35_turbo_id: azureOpenai35TurboID,
      azure_openai_45_turbo_id: azureOpenai45TurboID,
      azure_openai_45_vision_id: azureOpenai45VisionID,
      azure_openai_embeddings_id: azureEmbeddingsID,
      openrouter_api_key: openrouterAPIKey
    })

    setProfile(updatedProfile)

    toast.success("Profile updated!")

    const providers = [
      "openai",
      "google",
      "azure",
      "anthropic",
      "mistral",
      "groq",
      "perplexity",
      "openrouter"
    ]

    providers.forEach(async provider => {
      let providerKey: keyof typeof profile

      if (provider === "google") {
        providerKey = "google_gemini_api_key"
      } else if (provider === "azure") {
        providerKey = "azure_openai_api_key"
      } else {
        providerKey = `${provider}_api_key` as keyof typeof profile
      }

      const models = LLM_LIST_MAP[provider]
      const envKeyActive = envKeyMap[provider]

      if (!envKeyActive) {
        const hasApiKey = !!updatedProfile[providerKey]

        if (provider === "openrouter") {
          if (hasApiKey && availableOpenRouterModels.length === 0) {
            const openrouterModels: OpenRouterLLM[] =
              await fetchOpenRouterModels()
            setAvailableOpenRouterModels(prev => {
              const newModels = openrouterModels.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else {
            setAvailableOpenRouterModels([])
          }
        } else {
          if (hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev => {
              const newModels = models.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else if (!hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev =>
              prev.filter(model => !models.includes(model))
            )
          }
        }
      }
    })

    setIsOpen(false)
  }

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout | null

    return (...args: any[]) => {
      const later = () => {
        if (timeout) clearTimeout(timeout)
        func(...args)
      }

      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const checkUsernameAvailability = useCallback(
    debounce(async (username: string) => {
      if (!username) return

      if (username.length < PROFILE_USERNAME_MIN) {
        setUsernameAvailable(false)
        return
      }

      if (username.length > PROFILE_USERNAME_MAX) {
        setUsernameAvailable(false)
        return
      }

      const usernameMatch = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single()

      setUsernameAvailable(!usernameMatch.data)
    }, 500),
    []
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  // Fetch the admin and kiosk app status
  const [isAdmin, setIsAdmin] = useState(false)
  const [isKioskApp, setIsKioskApp] = useState(false)

  useEffect(() => {
    const fetchProfileStatus = async () => {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("isAdmin, kioskApp")
        .eq("id", profile?.id)
        .single()

      if (error) {
        console.error("Error fetching profile status:", error)
        return
      }

      setIsAdmin(profileData?.isAdmin || false)
      setIsKioskApp(profileData?.kioskApp || false)
    }

    if (profile?.id) {
      fetchProfileStatus()
    }
  }, [profile?.id])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {profile.image_url ? (
          <Image
            className="mt-2 size-[34px] cursor-pointer rounded hover:opacity-50"
            src={profile.image_url + "?" + new Date().getTime()}
            height={34}
            width={34}
            alt={"Image"}
          />
        ) : (
          <Button size="icon" variant="ghost">
            <IconUser size={SIDEBAR_ICON_SIZE} />
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        className="flex flex-col justify-between"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between space-x-2">
              <div>User Settings</div>
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="profile">
            {!isAdmin ? null : (
              <TabsList className="mt-4 grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="keys">API Keys</TabsTrigger>
              </TabsList>
            )}

            <TabsContent className="mt-4 space-y-4" value="profile">
              {isAdmin && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Label>Username</Label>
                      <div className="relative">
                        <Input
                          className="pr-10"
                          placeholder="Username..."
                          value={username}
                          onChange={e => {
                            setUsername(e.target.value)
                            checkUsernameAvailability(e.target.value)
                          }}
                          minLength={PROFILE_USERNAME_MIN}
                          maxLength={PROFILE_USERNAME_MAX}
                        />
                        {!usernameAvailable && !loadingUsername && (
                          <IconCircleXFilled
                            size={20}
                            className="absolute right-2 top-2 text-red-500"
                          />
                        )}
                        {usernameAvailable && !loadingUsername && (
                          <IconCircleCheckFilled
                            size={20}
                            className="absolute right-2 top-2 text-green-500"
                          />
                        )}
                        {loadingUsername && (
                          <IconLoader2
                            size={20}
                            className="absolute right-2 top-2 animate-spin text-gray-500"
                          />
                        )}
                      </div>
                    </div>
                    <LimitDisplay
                      used={username.length}
                      limit={PROFILE_USERNAME_MAX}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Profile Image</Label>
                    <ImagePicker
                      src={profileImageSrc}
                      image={profileImageFile}
                      height={50}
                      width={50}
                      onSrcChange={setProfileImageSrc}
                      onImageChange={setProfileImageFile}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Chat Display Name</Label>
                    <Input
                      placeholder="Chat display name..."
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      maxLength={PROFILE_DISPLAY_NAME_MAX}
                    />
                  </div>
                </>
              )}

              {!isKioskApp && (
                <div className="space-y-1">
                  <Label className="text-sm">
                    What would you like the AI to know about you to provide
                    better responses?
                  </Label>
                  <TextareaAutosize
                    value={profileInstructions}
                    onValueChange={setProfileInstructions}
                    placeholder="Profile context... (optional)"
                    minRows={6}
                    maxRows={10}
                  />
                  <LimitDisplay
                    used={profileInstructions.length}
                    limit={PROFILE_CONTEXT_MAX}
                  />
                </div>
              )}

              <div className="flex justify-center">
                {!isKioskApp && (
                  <Button
                    tabIndex={1}
                    className="text-lg"
                    size="lg"
                    onClick={handleSignOut}
                  >
                    <IconLogout className="flex items-center" size={30} />
                    Logout / Reset Password
                  </Button>
                )}
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent className="mt-4 space-y-4" value="keys">
                <div className="mt-5 space-y-2">
                  {/* API Keys Section */}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {!isKioskApp && (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
