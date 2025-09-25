import React, { useEffect, useMemo, useState } from "react";
import { ThemeModeContext } from "./ThemeModeContext";

const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  // Initialize mode. Default to light for public pages.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme-mode");
      if (saved === "dark" || saved === "light") {
        setMode(saved);
      } else {
        setMode("light");
      }
    } catch {
      setMode("light");
    }
  }, []);

  // Apply class and persist
  useEffect(() => {
    try {
      localStorage.setItem("theme-mode", mode);
    } catch (e){
      console.log(e);
    }
    const cls = "dark-mode";
    const body = document.body;
    if (mode === "dark") body.classList.add(cls); else body.classList.remove(cls);
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
    setMode,
    reset: () => setMode("light"),
  }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
  );
};

export default ThemeModeProvider;