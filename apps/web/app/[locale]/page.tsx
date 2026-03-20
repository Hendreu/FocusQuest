"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type GamificationProfile = {
  xp: number;
  level: number;
  streak: number;
  daily_xp: number;
  badges: any[];
  xp_to_next_level: number;
  xp_current_level: number;
};

type Course = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  language: string;
  isPremium: boolean | null;
  creatorId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-8">
      <div className="h-12 w-72 bg-bg-muted rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-bg-muted rounded-2xl animate-pulse" />
        <div className="h-40 bg-bg-muted rounded-2xl animate-pulse" />
        <div className="h-40 bg-bg-muted rounded-2xl animate-pulse" />
      </div>
      <div className="h-12 w-72 bg-bg-muted rounded-lg animate-pulse mt-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-[320px] bg-bg-muted rounded-2xl animate-pulse" />
        <div className="h-[320px] bg-bg-muted rounded-2xl animate-pulse" />
        <div className="h-[320px] bg-bg-muted rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { user, accessToken, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // Wait a tick for auth hydration before redirecting
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          router.push(`/${locale}/login`);
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    if (!accessToken) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, coursesRes] = await Promise.all([
          fetch(`${API_URL}/gamification/profile`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/courses?lang=${locale}`),
        ]);

        if (cancelled) return;

        if (!profileRes.ok)
          throw new Error("Failed to fetch gamification profile");
        if (!coursesRes.ok) throw new Error("Failed to fetch courses");

        const profileData = await profileRes.json();
        const coursesData = await coursesRes.json();

        if (cancelled) return;

        // API returns nested objects — normalize to flat profile shape
        const normalizedProfile: GamificationProfile = {
          xp: profileData?.level?.currentXp ?? profileData?.xp ?? 0,
          level: profileData?.level?.level ?? profileData?.level ?? 1,
          streak:
            profileData?.streak?.currentStreak ?? profileData?.streak ?? 0,
          daily_xp: profileData?.daily_xp ?? 0,
          badges: profileData?.badges ?? [],
          xp_to_next_level:
            profileData?.xp_to_next_level ??
            (profileData?.level?.level ?? 1) * 100,
          xp_current_level:
            profileData?.xp_current_level ??
            ((profileData?.level?.level ?? 1) - 1) * 100,
        };

        setProfile(normalizedProfile);
        setCourses(
          Array.isArray(coursesData)
            ? coursesData
            : (coursesData.courses ?? []),
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken, locale, router]);

  if (loading || (!profile && !error)) {
    return <DashboardSkeleton />;
  }

  // Calculate XP progress percentage
  const xpBase = profile ? profile.xp_current_level : 0;
  const xpNext = profile ? profile.xp_to_next_level : 100;
  const xpCurrent = profile ? profile.xp : 0;

  const xpRequiredForLevel = xpNext - xpBase;
  const xpProgressInLevel = xpCurrent - xpBase;
  const xpPercentage =
    xpRequiredForLevel > 0
      ? Math.min(
          100,
          Math.max(0, (xpProgressInLevel / xpRequiredForLevel) * 100),
        )
      : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-10 min-h-screen">
      {/* Header Section */}
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-text">
            {t("welcome", { name: user?.name?.split(" ")[0] || "Estudante" })}
          </h1>
          <p className="text-muted mt-2 font-medium">
            Pronto para mais um dia de conquistas?
          </p>
        </div>

        {error ? (
          <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20">
            <p className="font-bold flex items-center gap-2">
              <span>⚠️</span> Erro ao carregar os dados
            </p>
            <p className="mt-1 text-sm opacity-90">{error}</p>
          </div>
        ) : (
          profile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
              {/* Level Card */}
              <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform">
                  ⭐
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  {t("level", { level: profile.level })}
                </div>
                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-extrabold text-text">
                      Lvl {profile.level}
                    </span>
                    <span className="text-sm text-muted font-semibold">
                      {t("xpProgress", {
                        current: profile.xp,
                        next: profile.xp_to_next_level,
                      })}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-bg-muted rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${xpPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Streak Card */}
              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-200/50 rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform">
                  🔥
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  {t("streak")}
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-3xl font-extrabold text-text">
                    {profile.streak}
                  </span>
                  <span className="text-lg text-muted font-bold">dias</span>
                </div>
              </div>

              {/* Daily XP Card */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-200/50 rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
                  {t("dailyGoal")}
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                  <span className="text-3xl font-extrabold text-text">
                    {profile.daily_xp}
                  </span>
                  <span className="text-lg text-muted font-bold">
                    {t("xpToday")}
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </section>

      {/* Courses Section */}
      <section className="flex flex-col gap-6 animate-fadeIn">
        <h2 className="text-2xl font-bold text-text m-0">
          {t("continuelearning")}
        </h2>

        {courses.length === 0 && !loading && !error && (
          <div className="py-16 text-center bg-surface rounded-2xl border border-border shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-lg text-muted font-medium">
              Nenhum curso disponível no momento.
            </p>
            <button
              onClick={() => router.push(`/${locale}/courses`)}
              className="mt-4 px-6 py-2 bg-bg-muted hover:bg-bg-emphasis text-text rounded-xl font-bold transition-colors"
            >
              Explorar Catálogo
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Array.isArray(courses) ? courses : []).map((course) => (
            <div
              key={course.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
              onClick={() => router.push(`/${locale}/courses/${course.id}`)}
            >
              {course.thumbnailUrl ? (
                <div className="relative h-44 w-full overflow-hidden border-b border-border">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div className="w-full h-44 bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-col items-center justify-center border-b border-border gap-2">
                  <span className="text-4xl opacity-50">📖</span>
                  <span className="text-muted text-sm">Sem Imagem</span>
                </div>
              )}

              <div className="p-5 flex flex-col gap-3 flex-1">
                <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors m-0 line-clamp-2 leading-tight">
                  {course.title}
                </h3>

                <p className="m-0 text-sm text-muted leading-relaxed flex-1 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex justify-between items-center mt-2 pt-4 border-t border-border">
                  <span className="text-xs font-semibold px-3 py-1 bg-success/10 text-success rounded-full">
                    {course.status === "published"
                      ? "Disponível"
                      : course.status}
                  </span>
                  {course.isPremium && (
                    <span className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full uppercase tracking-wider">
                      Premium
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
