
import { createContext, useContext } from "react"

type Theme = "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDarkMode: boolean
  toggleTheme: () => void
  systemPreference: "light" | null
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  isDarkMode: false,
  toggleTheme: () => null,
  systemPreference: "light",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "boinvit-ui-theme",
  ...props
}: ThemeProviderProps) {
  const theme: Theme = "light"; // Always light theme

  const value = {
    theme,
    setTheme: () => {}, // No-op
    isDarkMode: false, // Always false
    toggleTheme: () => {}, // No-op
    systemPreference: "light" as const,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
