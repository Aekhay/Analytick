"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

const ThemeCtx = createContext({ dark: true, toggle: () => {} });

export function useTheme() {
  return useContext(ThemeCtx);
}

export default function ThemeProvider({ children }) {
  const [dark, toggle] = useReducer(
    (d) => !d,
    true,
    () => {
      if (typeof window === "undefined") return true;
      return localStorage.getItem("theme") !== "light";
    }
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <ThemeCtx.Provider value={{ dark, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
