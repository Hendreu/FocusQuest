"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function Sidebar() {
  const { isAuthenticated, user, clearAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch: server always renders null,
  // client also renders null until mounted + auth hydrated
  if (!mounted || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    clearAuth();
    router.push(`/${locale}/login`);
  };

  const navLinks = [
    { href: `/${locale}`, icon: "📊", label: "Dashboard" },
    { href: `/${locale}/courses`, icon: "📚", label: "Cursos" },
    { href: `/${locale}/profile`, icon: "👤", label: "Perfil" },
    { href: `/${locale}/settings`, icon: "⚙️", label: "Configurações" },
  ];

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const toggleDesktop = () => setIsDesktopCollapsed(!isDesktopCollapsed);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface border border-border shadow-sm"
      >
        {isMobileOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen z-40
          bg-bg-subtle border-r border-border
          transition-all duration-300 ease-in-out flex flex-col
          ${isMobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full md:translate-x-0"}
          ${isDesktopCollapsed ? "md:w-[72px]" : "md:w-[260px]"}
        `}
      >
        {/* Header / Collapse Toggle */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-border">
          {(!isDesktopCollapsed || isMobileOpen) && (
            <span className="font-bold text-lg text-primary truncate">
              FocusQuest
            </span>
          )}
          <button
            onClick={toggleDesktop}
            className="hidden md:flex p-1.5 rounded-md hover:bg-bg-muted text-muted"
          >
            {isDesktopCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* User Profile */}
        <div
          className={`p-4 border-b border-border flex items-center gap-3 ${isDesktopCollapsed && !isMobileOpen ? "justify-center flex-col p-2" : ""}`}
        >
          <div className="w-10 h-10 rounded-full bg-primary-subtle text-primary flex items-center justify-center font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          {(!isDesktopCollapsed || isMobileOpen) && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-text truncate">
                {user?.name || "Usuário"}
              </span>
              <span className="text-xs text-badge bg-badge/10 px-2 py-0.5 rounded-full w-fit mt-1 font-medium">
                Lvl{" "}
                {"level" in (user || {})
                  ? (user as unknown as { level: number }).level
                  : 1}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-primary-subtle text-primary font-medium"
                      : "text-text hover:bg-bg-muted hover:text-primary"
                  }
                  ${isDesktopCollapsed && !isMobileOpen ? "justify-center" : ""}
                `}
                title={link.label}
              >
                <span className="text-xl shrink-0">{link.icon}</span>
                {(!isDesktopCollapsed || isMobileOpen) && (
                  <span className="truncate">{link.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-error hover:bg-error/10 transition-colors
              ${isDesktopCollapsed && !isMobileOpen ? "justify-center" : ""}
            `}
            title="Sair"
          >
            <span className="text-xl shrink-0">🚪</span>
            {(!isDesktopCollapsed || isMobileOpen) && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
