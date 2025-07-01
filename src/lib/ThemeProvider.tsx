
import React, { createContext, useContext } from "react";

type Theme = "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (value: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme: Theme = "light"; // Always light theme

  const setTheme = () => {
    // No-op since we only support light theme
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
