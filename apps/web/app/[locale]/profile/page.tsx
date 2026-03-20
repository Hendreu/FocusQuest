"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";

interface ProfileData {
  userId: string;
  level: {
    userId: string;
    currentXp: number;
    level: number;
    updatedAt: string;
  };
  streak: {
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    streakFreezes: number;
  };
  badges: Array<{
    id?: string;
    name?: string;
    icon?: string;
    description?: string;
  }>;
  activeQuests: any[];
  coins: {
    userId: string;
    balance: number;
    updatedAt: string;
  };
  recentXpEvents: Array<{
    id?: string;
    amount: number;
    reason: string;
    createdAt: string;
  }>;
  leaderboardPosition: number;
}

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const { user, accessToken, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "pt";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      const timer = setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mounted, isAuthenticated, router, locale]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
        const res = await fetch(`${API_URL}/gamification/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("Falha ao carregar perfil");
        }

        const data = await res.json();

        if (!cancelled) {
          setProfileData(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken]);

  if (!mounted || loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex flex-col gap-10 min-h-screen">
        <div>
          <div className="h-10 w-48 bg-bg-muted rounded-2xl animate-pulse mb-2" />
          <div className="h-4 w-64 bg-bg-muted rounded-2xl animate-pulse" />
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-md h-32 animate-pulse" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-bg-muted rounded-2xl animate-pulse"
            />
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-md h-48 animate-pulse" />
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-md h-48 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 flex flex-col gap-10 min-h-screen justify-center items-center">
        <div className="bg-surface border border-border rounded-2xl p-8 text-center shadow-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Erro</h2>
          <p className="text-text">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const level = profileData?.level?.level || 1;
  const currentXp = profileData?.level?.currentXp || 0;
  const nextLevelXp = level * 100;
  const xpPercentage = Math.min(
    100,
    Math.max(0, (currentXp / nextLevelXp) * 100),
  );

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-10 min-h-screen">
      <header>
        <h1 className="text-4xl font-extrabold text-text mb-2">Meu Perfil</h1>
        <p className="text-muted">Acompanhe seu progresso e conquistas</p>
      </header>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-md flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold border-2 border-primary/20 shrink-0">
          {avatarLetter}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-text truncate">
            {user?.name || "Usuário"}
          </h2>
          <p className="text-muted truncate">
            {user?.email || "email@exemplo.com"}
          </p>
        </div>
        <div className="hidden sm:block">
          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm border border-primary/20">
            {user?.role === "super_admin" || user?.role === "admin"
              ? "Administrador"
              : "Estudante"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">
            ⭐
          </div>
          <h3 className="text-sm font-semibold text-muted mb-1 relative z-10">
            Nível
          </h3>
          <p className="text-3xl font-extrabold text-text mb-4 relative z-10">
            {level}
          </p>
          <div className="relative z-10 mt-auto">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>{currentXp} XP</span>
              <span>{nextLevelXp} XP</span>
            </div>
            <div className="h-3 bg-bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-200/50 rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">
            🔥
          </div>
          <h3 className="text-sm font-semibold text-muted mb-1 relative z-10">
            Ofensiva
          </h3>
          <p className="text-3xl font-extrabold text-text mb-2 relative z-10">
            {profileData?.streak?.currentStreak || 0}
          </p>
          <p className="text-xs text-muted relative z-10 mt-auto">
            Máx: {profileData?.streak?.longestStreak || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-200/50 rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">
            💰
          </div>
          <h3 className="text-sm font-semibold text-muted mb-1 relative z-10">
            Moedas
          </h3>
          <p className="text-3xl font-extrabold text-text relative z-10 mt-auto">
            {profileData?.coins?.balance || 0}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200/50 rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform select-none">
            🏆
          </div>
          <h3 className="text-sm font-semibold text-muted mb-1 relative z-10">
            Ranking
          </h3>
          <p className="text-3xl font-extrabold text-text relative z-10 mt-auto">
            {profileData?.leaderboardPosition
              ? `#${profileData.leaderboardPosition}`
              : "-"}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-md">
        <h3 className="text-3xl font-extrabold text-text mb-6">Badges</h3>
        {!profileData?.badges || profileData.badges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="text-6xl mb-4">🏆</span>
            <p className="text-muted font-medium text-lg">
              Nenhuma badge conquistada ainda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {profileData.badges.map((badge, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center p-4 bg-bg-muted rounded-xl border border-border hover:shadow-md transition-shadow"
              >
                <span className="text-4xl mb-2">{badge.icon || "🏅"}</span>
                <span className="text-sm font-semibold text-center text-text">
                  {badge.name || "Badge"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-md mb-10">
        <h3 className="text-3xl font-extrabold text-text mb-6">
          Eventos Recentes de XP
        </h3>
        {!profileData?.recentXpEvents ||
        profileData.recentXpEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="text-6xl mb-4">⚡</span>
            <p className="text-muted font-medium text-lg">
              Nenhum evento de XP recente
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {profileData.recentXpEvents.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-bg-muted rounded-xl border border-border"
              >
                <div>
                  <p className="font-semibold text-text text-lg">
                    {event.reason || "Recompensa"}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    {event.createdAt
                      ? new Date(event.createdAt).toLocaleDateString("pt-BR")
                      : "Recentemente"}
                  </p>
                </div>
                <div className="font-bold text-green-500 bg-green-500/10 px-4 py-2 rounded-full">
                  +{event.amount || 0} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
