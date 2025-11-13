import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  defaultTheme?: "system" | "light" | "dark";
}

export const ThemeToggle = ({ defaultTheme = "system" }: ThemeToggleProps) => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      applyTheme(defaultTheme);
    }
  }, [defaultTheme]);

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const htmlElement = document.documentElement;
    
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      htmlElement.classList.remove("light", "dark");
      htmlElement.classList.add(systemTheme);
    } else {
      htmlElement.classList.remove("light", "dark");
      htmlElement.classList.add(newTheme);
    }

    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  const isDark = theme === "dark" || 
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-glass hover:bg-white/10 border border-glass-border transition-all duration-300 hover:shadow-glow-teal focus:outline-none focus:ring-2 focus:ring-neon-teal/50"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-neon-cyan transition-transform duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-neon-purple transition-transform duration-300" />
      )}
    </button>
  );
};
