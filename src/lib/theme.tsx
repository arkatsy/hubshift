import { createContext, useEffect, useState } from "react"

export const enum Theme {
  light = "light",
  dark = "dark",
}

type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: Theme.light,
  toggleTheme: () => {},
})

const getTheme = (): Theme => {
  if (typeof window === "undefined") {
    return Theme.light
  } else {
    let theme = localStorage.getItem("theme") as Theme | null

    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.dark : Theme.light
    }

    return theme
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getTheme())

  const toggleTheme = () => {
    setTheme(theme === Theme.light ? Theme.dark : Theme.light)
  }

  useEffect(() => {
    if (theme === Theme.dark) {
      document.documentElement.classList.add(Theme.dark)
      localStorage.setItem("theme", Theme.dark)
    } else {
      document.documentElement.classList.remove(Theme.dark)
      localStorage.setItem("theme", Theme.light)
    }
  }, [theme])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
