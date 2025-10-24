"use client";

import { createContext, useState, useContext } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children, user }) {
  const [ctxUser, setCtxUser] = useState(user || null);

  return (
    <AppContext.Provider value={{ ctxUser, setCtxUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}