"use client";

import { useState, useEffect } from "react";
import { NotificationCenter } from "../features/notifications/NotificationCenter";
import { useAuth } from "../hooks/useAuth";

export function HeaderActions() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isAuthenticated) return null;

  return (
    <div style={{ position: "fixed", top: "16px", right: "16px", zIndex: 50 }}>
      <NotificationCenter />
    </div>
  );
}
