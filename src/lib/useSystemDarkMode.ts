
import { useEffect } from "react";

/**
 * Sets the `dark` class on the HTML root element according to device preference
 * and listens for changes in system settings.
 */
export function useSystemDarkMode() {
  useEffect(() => {
    const applyDarkMode = () => {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    applyDarkMode();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", applyDarkMode);
    return () => mq.removeEventListener("change", applyDarkMode);
  }, []);
}
