import React, { useEffect, useMemo, useState } from "react";
import { ThemeModeContext } from "./ThemeModeContext";

const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem("theme-mode");
      return saved === "dark" || saved === "light" ? saved : "light";
    } catch {
      return "light";
    }
  });

  // Apply class and persist
  useEffect(() => {
    try {
      localStorage.setItem("theme-mode", mode);
    } catch (e) {
      console.log(e);
    }
    const cls = "dark-mode";
    const body = document.body;
    if (mode === "dark") body.classList.add(cls);
    else body.classList.remove(cls);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
      setMode,
      reset: () => setMode("light"),
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export default ThemeModeProvider;
