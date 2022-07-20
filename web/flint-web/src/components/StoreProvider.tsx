import React, { createContext, FC } from "react";

import { globalStore } from "../stores/GlobalStore";
import { pageStore } from "../stores/page-store";
import { configStore } from "../stores/config-store";

// localStorage 存储的 GlobalStore
export const GlobalStoreContext = createContext(globalStore);

export const PageStoreContext = createContext(pageStore);

export const ConfigStoreContext = createContext(configStore);

export interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: FC<StoreProviderProps> = ({ children }) => (
  <GlobalStoreContext.Provider value={globalStore}>
    <PageStoreContext.Provider value={pageStore}>{children}</PageStoreContext.Provider>
  </GlobalStoreContext.Provider>
);
