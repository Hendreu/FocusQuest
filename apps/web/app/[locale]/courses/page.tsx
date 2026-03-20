"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "../../../lib/auth/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  difficulty: string;
  estimatedHours: number;
  isPremium: boolean;
  language: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "pt-BR";
  const { accessToken } = useAuthStore();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/courses?lang=${locale}`, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        });
        const json = await res.json();
        const list = json.courses ?? json.data ?? json;
        setCourses(Array.isArray(list) ? list : []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [locale, accessToken]);

  const difficultyLabel: Record<string, string> = {
    beginner: "Iniciante",
    intermediate: "Intermediario",
    advanced: "Avancado",
  };

  const difficultyColor: Record<string, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-48 bg-bg-muted rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-bg-muted rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-2xl h-72 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-text">
          Catalogo de Cursos
        </h1>
        <p className="text-muted mt-1">
          Explore todos os cursos disponiveis e comece sua jornada de
          aprendizado.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-lg text-muted font-medium">
            Nenhum curso disponivel no momento.
          </p>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="mt-4 px-6 py-2 bg-bg-muted hover:bg-bg-emphasis text-text rounded-xl font-bold transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
              onClick={() => router.push(`/${locale}/courses/${course.id}`)}
            >
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl opacity-60">
                      {course.difficulty === "beginner"
                        ? "🌱"
                        : course.difficulty === "intermediate"
                          ? "🌿"
                          : "🌳"}
                    </span>
                  </div>
                )}
                {course.isPremium && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    Premium
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      difficultyColor[course.difficulty] ??
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {difficultyLabel[course.difficulty] ?? course.difficulty}
                  </span>
                  {course.estimatedHours > 0 && (
                    <span className="text-xs text-muted">
                      {course.estimatedHours}h
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-text text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>

                <p className="text-sm text-muted line-clamp-3 flex-1">
                  {course.description}
                </p>

                <div className="mt-4 pt-3 border-t border-border">
                  <span className="text-sm font-semibold text-indigo-600 group-hover:underline">
                    Ver curso →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
