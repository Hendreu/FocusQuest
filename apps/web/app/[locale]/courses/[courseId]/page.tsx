"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Lesson {
  id: string;
  title: string;
  content_type: string;
  duration_minutes: number;
  is_premium: boolean;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  language: string;
  isPremium: boolean;
  status: string;
}

interface CurriculumResponse {
  course: Course;
  modules: Module[];
  totalDurationMinutes: number;
  totalLessons: number;
}

function ContentTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "text":
      return <span title="Texto">📖</span>;
    case "video":
      return <span title="Video">🎬</span>;
    case "quiz":
      return <span title="Quiz">❓</span>;
    case "code":
      return <span title="Codigo">💻</span>;
    default:
      return <span>📄</span>;
  }
}

function CourseSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col gap-8">
      <div className="h-12 w-3/5 bg-bg-muted rounded-lg animate-pulse" />
      <div className="h-6 w-4/5 bg-bg-muted rounded-lg animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-bg-muted rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const locale = (params.locale as string) ?? "pt-BR";
  const { accessToken } = useAuthStore();

  const [data, setData] = useState<CurriculumResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    async function fetchCurriculum() {
      try {
        setLoading(true);
        const headers: Record<string, string> = {};
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

        const res = await fetch(`${API_URL}/courses/${courseId}/curriculum`, {
          headers,
        });

        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "Curso não encontrado"
              : "Erro ao carregar o curso",
          );
        }

        const json = await res.json();
        if (!cancelled) {
          setData(json);
          // Expand all modules by default
          const allModuleIds = new Set<string>(
            (json.modules ?? []).map((m: Module) => m.id),
          );
          setExpandedModules(allModuleIds);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCurriculum();
    return () => {
      cancelled = true;
    };
  }, [courseId, accessToken]);

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  function navigateToLesson(lessonId: string) {
    router.push(`/${locale}/courses/${courseId}/lessons/${lessonId}`);
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  if (loading) return <CourseSkeleton />;

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="p-6 bg-error/10 text-error rounded-2xl border border-error/20">
          <p className="m-0 font-semibold text-lg">
            {error ?? "Erro ao carregar o curso"}
          </p>
          <button
            onClick={() => router.push(`/${locale}`)}
            className="mt-4 px-6 py-2 bg-error text-white rounded-xl font-semibold hover:bg-error/90 transition-colors"
          >
            Voltar ao inicio
          </button>
        </div>
      </div>
    );
  }

  const { course, modules, totalDurationMinutes, totalLessons } = data;

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col gap-8 min-h-screen animate-fadeIn">
      {/* Back navigation */}
      <button
        onClick={() => router.push(`/${locale}`)}
        className="text-sm font-medium text-muted hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-0 text-left"
      >
        ← Voltar ao inicio
      </button>

      {/* Course header */}
      <section className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl p-8 border border-border flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold text-text leading-tight">
          {course.title}
        </h1>

        {course.description && (
          <p className="text-muted text-lg leading-relaxed max-w-2xl">
            {course.description}
          </p>
        )}

        {/* Stats bar */}
        <div className="flex gap-4 flex-wrap py-4 border-t border-b border-border">
          <div className="flex items-center gap-2 px-4 py-2 bg-bg-subtle rounded-full">
            <span className="text-lg">📚</span>
            <span className="font-semibold text-text text-sm">
              {modules.length} {modules.length === 1 ? "Modulo" : "Modulos"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-bg-subtle rounded-full">
            <span className="text-lg">📝</span>
            <span className="font-semibold text-text text-sm">
              {totalLessons} {totalLessons === 1 ? "Aula" : "Aulas"}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-bg-subtle rounded-full">
            <span className="text-lg">⏱️</span>
            <span className="font-semibold text-text text-sm">
              {formatDuration(totalDurationMinutes)}
            </span>
          </div>
          {course.isPremium && (
            <span className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full text-xs font-bold uppercase tracking-wider self-center">
              Premium
            </span>
          )}
        </div>

        {/* Start learning CTA */}
        {modules.length > 0 && modules[0].lessons.length > 0 && (
          <button
            onClick={() => navigateToLesson(modules[0].lessons[0].id)}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-bold text-base self-start hover:scale-105 hover:shadow-lg transition-all duration-300"
          >
            Comecar a Aprender
          </button>
        )}
      </section>

      {/* Curriculum */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-text">Conteudo do Curso</h2>

        <div className="flex flex-col gap-3">
          {modules.map((mod) => {
            const isExpanded = expandedModules.has(mod.id);
            const moduleDuration = mod.lessons.reduce(
              (sum, l) => sum + l.duration_minutes,
              0,
            );

            return (
              <div
                key={mod.id}
                className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Module header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex justify-between items-center p-5 bg-transparent border-none cursor-pointer text-left hover:bg-bg-subtle transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-base text-text">
                      {mod.order}. {mod.title}
                    </span>
                    <span className="text-sm text-muted font-medium">
                      {mod.lessons.length}{" "}
                      {mod.lessons.length === 1 ? "aula" : "aulas"} •{" "}
                      {formatDuration(moduleDuration)}
                    </span>
                  </div>
                  <span
                    className={`text-lg text-muted transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {/* Lessons list */}
                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border">
                    {mod.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => navigateToLesson(lesson.id)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 bg-transparent border-none cursor-pointer text-left hover:bg-bg-subtle transition-colors group"
                      >
                        <div className="text-lg shrink-0 w-8 h-8 flex items-center justify-center bg-primary-subtle rounded-lg">
                          <ContentTypeIcon type={lesson.content_type} />
                        </div>
                        <span className="flex-1 text-sm font-medium text-text group-hover:text-primary transition-colors">
                          {lesson.title}
                        </span>
                        <span className="text-xs text-muted font-medium shrink-0 px-2 py-1 bg-bg-muted rounded-full">
                          {lesson.duration_minutes} min
                        </span>
                        {lesson.is_premium && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full text-[0.65rem] font-bold uppercase shrink-0">
                            PRO
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
