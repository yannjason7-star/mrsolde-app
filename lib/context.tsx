"use client";
import { createContext, useContext, useState } from 'react';

type Role = 'admin' | 'manager' | 'seller';

const AuthContext = createContext({
  user: { name: "Devoryn", role: 'admin' as Role }, // Par défaut pour le dev
  setUser: (user: any) => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState({ name: "Devoryn", role: 'admin' as Role });
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);