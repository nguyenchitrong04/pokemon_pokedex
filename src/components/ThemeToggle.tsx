"use client"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect này giúp tránh lỗi Hydration (lỗi lệch màu giữa Server và Client khi load trang)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="p-2 w-10 h-10" />

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-yellow-400 transition-all hover:scale-110 border dark:border-slate-700"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}