
import React, { createContext, useState, useContext, useEffect } from "react";

type Theme = "system" | "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (value: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first, fallback to system
    const stored = localStorage.getItem("theme") as Theme;
    return stored && ["system", "light", "dark"].includes(stored) ? stored : "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Apply theme and update resolved theme
  useEffect(() => {
    const root = document.documentElement;

    function apply(theme: Theme) {
      if (theme === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", isDark);
        setResolvedTheme(isDark ? "dark" : "light");
      } else {
        const isDark = theme === "dark";
        root.classList.toggle("dark", isDark);
        setResolvedTheme(isDark ? "dark" : "light");
      }
    }

    apply(theme);
    localStorage.setItem("theme", theme);

    // System change handler
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      if (theme === "system") {
        apply("system");
      }
    };
    mq.addEventListener("change", update);

    return () => {
      mq.removeEventListener("change", update);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
