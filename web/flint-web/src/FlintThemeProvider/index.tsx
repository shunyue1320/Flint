import React, { FC } from "react";
// import classNames from "classnames";
import { useIsomorphicLayoutEffect } from "react-use";
import { useDarkMode, FlintPrefersColorScheme } from "./useDarkMode";

export * from "./useDarkMode";

export const DarkModeContext = React.createContext(false);

export interface FlintThemeBodyProviderProps {
  prefersColorScheme?: FlintPrefersColorScheme;
  children: React.ReactNode;
}

export const FlintThemeBodyProvider: FC<FlintThemeBodyProviderProps> = ({
  prefersColorScheme = "light",
  children,
}) => {
  const darkMode = useDarkMode(prefersColorScheme);
  useIsomorphicLayoutEffect(() => {
    document.body.classList.add("flat-theme-root");
    document.body.classList.toggle("flat-color-scheme-dark", darkMode);
  }, [darkMode]);
  return <DarkModeContext.Provider value={darkMode}> {children} </DarkModeContext.Provider>;
};
