"use client"

import { IconArrowRight } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Link from "next/link"

export default function HomePage() {
  const { theme } = useTheme()

  useEffect(() => {
    // Set the default theme to light
    const storedTheme = localStorage.getItem("theme")
    if (!storedTheme) {
      setTheme("light")
      localStorage.setItem("theme", "light")
    } else {
      setTheme(storedTheme)
    }
  }, [setTheme])

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <img src="/SignalBadge.png" alt="Chatbot UI" style={{ width: '220px', height: 'auto' }} />
      </div>
      
      <div className="mt-2 text-4xl font-bold">SignalBot UI</div>

      <Link
        className="mt-4 flex w-[200px] items-center justify-center rounded-md bg-blue-500 p-2 font-semibold"
        href="/login"
      >
        Start Chatting
        <IconArrowRight className="ml-1" size={20} />
      </Link>
    </div>
  )
}
