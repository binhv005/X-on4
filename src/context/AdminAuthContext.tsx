"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminRole, AdminUser } from "@/types/admin";

interface AdminAuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: AdminRole[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: AdminUser = {
  id: "admin-default",
  email: "admin@xon.com",
  name: "Administrator",
  role: "Super Admin",
  status: "active",
  createdAt: new Date().toISOString(),
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(DEFAULT_ADMIN);
  const [token, setToken] = useState<string | null>("bypass-token");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const login = async (email: string, password: string) => {
    setUser(DEFAULT_ADMIN);
    setToken("bypass-token");
    setIsLoading(false);
    router.push("/admin");
    return { success: true };
  };

  const logout = async () => {
    setUser(DEFAULT_ADMIN);
  };

  const hasRole = (_roles: AdminRole[]) => {
    return true;
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: true,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
