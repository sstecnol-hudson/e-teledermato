"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  FolderPlus,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Profile } from "@/lib/types/database";

interface SidebarProps {
  user: Profile;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["solicitante", "dermatologista", "gestor", "admin"] },
  { name: "Pacientes", href: "/dashboard/pacientes", icon: Users, roles: ["solicitante", "dermatologista", "gestor", "admin"] },
  { name: "Novo Caso", href: "/dashboard/casos/novo", icon: FolderPlus, roles: ["solicitante", "admin"] },
  { name: "Meus Casos", href: "/dashboard/casos", icon: FileText, roles: ["solicitante", "dermatologista", "gestor", "admin"] },
  { name: "Metricas", href: "/dashboard/metricas", icon: BarChart3, roles: ["gestor", "admin"] },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

  const roleLabels: Record<string, string> = {
    solicitante: "Solicitante",
    dermatologista: "Dermatologista",
    gestor: "Gestor",
    admin: "Administrador",
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)]"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border)]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="p-2 bg-cyan-600 rounded-xl">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-bold text-[var(--foreground)]">E-Teledermato</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition",
                  isActive
                    ? "bg-cyan-50 text-cyan-700"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="px-4 py-3 bg-[var(--secondary)] rounded-lg mb-3">
            <p className="font-medium text-[var(--foreground)] truncate">{user.full_name}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{roleLabels[user.role]}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
