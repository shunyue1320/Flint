import React, { createContext, FC } from "react";
import { globalStore } from "../stores/GlobalStore";

// localStorage 存储的 GlobalStore
export const GlobalStoreContext = createContext(globalStore);

export interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: FC<StoreProviderProps> = ({ children }) => (
  <GlobalStoreContext.Provider value={globalStore}>{children}</GlobalStoreContext.Provider>
);
