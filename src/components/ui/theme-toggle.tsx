
import React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeConfig = {
    system: {
      icon: Monitor,
      label: "System",
      description: "Use system preference"
    },
    light: {
      icon: Sun,
      label: "Light",
      description: "Light theme"
    },
    dark: {
      icon: Moon,
      label: "Dark",
      description: "Dark theme"
    }
  };

  const CurrentIcon = themeConfig[theme].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative h-9 w-9 p-0 transition-all duration-200",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(themeConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = theme === key;
          
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => setTheme(key as any)}
              className={cn(
                "flex items-center gap-3 cursor-pointer transition-colors",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
              <div className="flex flex-col">
                <span className="font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground">
                  {config.description}
                </span>
              </div>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
