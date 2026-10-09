import { useState } from "react";
import { getTheme, setTheme, type Theme } from "../utils/theme";

export default function ThemeToggle() {
  const [theme, setLocal] = useState<Theme>(getTheme);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    setLocal(next);
  };

  return (
    <button
      type="button"
      className="btn-secondary btn-small"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}