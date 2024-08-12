"use client"

import { supabase } from "@/lib/supabase/browser-client"
import { useRouter } from "next/navigation"
import { FC, useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog"
import { Input } from "../ui/input"
import { toast } from "sonner"

interface ChangePasswordProps {}

export const ChangePassword: FC<ChangePasswordProps> = () => {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return toast.info("Please fill in all password fields.")
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match. Please try again.")
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        console.error("Error updating password:", error)
        toast.error("Failed to change password. Please try again.")
        return
      }

      toast.success("Password changed successfully.")
      router.push("/login")
    } catch (error) {
      console.error("Unexpected error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true}>
      <DialogContent className="h-[240px] w-[400px] p-4">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <Input
          id="password"
          placeholder="New Password"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />

        <Input
          id="confirmPassword"
          placeholder="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />

        <DialogFooter>
          <Button onClick={handleResetPassword} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
