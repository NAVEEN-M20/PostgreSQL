import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Simple theme mode context to toggle light/dark
const ThemeModeContext = createContext({ mode: "light", toggle: () => {} });

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  // Load saved mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme-mode");
      if (saved === "dark" || saved === "light") {
        setMode(saved);
      }
    } catch {}
  }, []);

  // Apply class and persist
  useEffect(() => {
    try {
      localStorage.setItem("theme-mode", mode);
    } catch {}
    const cls = "dark-mode";
    const body = document.body;
    if (mode === "dark") body.classList.add(cls); else body.classList.remove(cls);
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
    setMode,
  }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);
