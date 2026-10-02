// src/context/ShellContext.jsx
import { createContext, useContext } from 'react';

export const ShellContext = createContext({
  openSidebar: () => {},
  closeSidebar: () => {},
  sidebarOpen: false,
  user: null,
  isLoadingUser: true,
});

export const useShell = () => useContext(ShellContext);