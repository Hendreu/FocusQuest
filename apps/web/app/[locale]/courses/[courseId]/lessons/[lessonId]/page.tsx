"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ContentPlayer } from "@repo/content-player";
import type { LessonCompleteResult } from "@repo/content-player";
import { useAuthStore } from "@/lib/auth/auth-store";
import { usePreferences } from "@/hooks/usePreferences";
import { FocusMode, useFocusMode } from "@/features/neuro/FocusMode";
import { usePomodoroState } from "@/features/neuro/usePomodoroState";
import { PomodoroTimer } from "@/features/neuro/PomodoroTimer";
import { BreakScreen } from "@/features/neuro/BreakScreen";
import { SensoryPanel } from "@/features/neuro/SensoryPanel";
import { MicrolearningBanner } from "@/features/neuro/MicrolearningBanner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LessonStub {
  id: string;
  title: string;
  content_type: string;
  order: number;
  duration_minutes?: number;
  completed?: boolean;
}

interface ModuleStub {
  id: string;
  title: string;
  order: number;
  lessons: LessonStub[];
}

interface CurriculumData {
  modules: ModuleStub[];
}

// ─── Inner Page (uses FocusMode context) ──────────────────────────────────────

function LessonPageInner() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const { accessToken } = useAuthStore();
  const { preferences } = usePreferences();

  const { active: focusActive, toggle: toggleFocus } = useFocusMode();

  const focusDuration = preferences?.focusDurationMinutes ?? 25;
  const {
    state: pomodoroState,
    start,
    skipBreak,
    pause,
  } = usePomodoroState(focusDuration);

  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lessonDurationMinutes, setLessonDurationMinutes] = useState(0);

  // Flatten lessons for prev/next navigation
  const allLessons: LessonStub[] =
    curriculum?.modules.flatMap((m) => m.lessons) ?? [];
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = allLessons[currentIdx] ?? null;
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  // Update lessonDurationMinutes when current lesson changes
  useEffect(() => {
    if (currentLesson?.duration_minutes != null) {
      setLessonDurationMinutes(currentLesson.duration_minutes);
    }
  }, [currentLesson]);

  // Fetch curriculum
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    async function fetchCurriculum() {
      try {
        const headers: Record<string, string> = {};
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        const res = await fetch(`${API_URL}/courses/${courseId}/curriculum`, {
          headers,
        });
        if (res.ok) {
          const json = (await res.json()) as CurriculumData;
          if (!cancelled) setCurriculum(json);
        }
      } catch {
        // Non-critical — sidebar just won't show
      }
    }

    void fetchCurriculum();
    return () => {
      cancelled = true;
    };
  }, [courseId, accessToken]);

  const handleComplete = useCallback(
    (_result: LessonCompleteResult) => {
      setCurriculum((prev) => {
        if (!prev) return prev;
        return {
          modules: prev.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === lessonId ? { ...l, completed: true } : l,
            ),
          })),
        };
      });
    },
    [lessonId],
  );

  function navigateToLesson(lid: string) {
    router.push(
      `/${(params.locale as string) ?? "pt-BR"}/courses/${courseId}/lessons/${lid}`,
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-background)",
      }}
    >
      {/* Sidebar — curriculum */}
      {sidebarOpen && (
        <aside
          className="sidebar"
          style={{
            width: "280px",
            flexShrink: 0,
            borderRight: "1px solid var(--color-border)",
            overflowY: "auto",
            padding: "1rem 0",
          }}
        >
          <div
            style={{
              padding: "0 1rem 1rem",
              borderBottom: "1px solid var(--color-border)",
              marginBottom: "0.5rem",
            }}
          >
            <button
              onClick={() =>
                router.push(
                  `/${(params.locale as string) ?? "pt-BR"}/courses/${courseId}`,
                )
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-muted)",
                fontSize: "0.875rem",
                padding: 0,
              }}
            >
              ← Voltar ao curso
            </button>
          </div>

          {curriculum?.modules.map((mod) => (
            <div key={mod.id} style={{ marginBottom: "0.5rem" }}>
              <div
                style={{
                  padding: "0.5rem 1rem",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "var(--color-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {mod.title}
              </div>
              {mod.lessons.map((lesson) => {
                const isCurrent = lesson.id === lessonId;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => navigateToLesson(lesson.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      width: "100%",
                      padding: "0.6rem 1rem",
                      background: isCurrent
                        ? "var(--color-primary-bg, rgba(99,102,241,0.1))"
                        : "transparent",
                      border: "none",
                      borderLeft: isCurrent
                        ? "3px solid var(--color-primary)"
                        : "3px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: isCurrent ? 600 : 400,
                      color: "var(--color-text)",
                    }}
                  >
                    <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>
                      {lesson.completed ? "✅" : isCurrent ? "▶️" : "⬜"}
                    </span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lesson.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Topbar */}
        <div
          className="header-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1.5rem",
            borderBottom: "1px solid var(--color-border)",
            position: "sticky",
            top: 0,
            background: "var(--color-background)",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Fechar índice" : "Abrir índice"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.125rem",
            }}
          >
            ☰
          </button>
          <nav
            aria-label="breadcrumb"
            style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}
          >
            <span>Cursos</span>
            <span style={{ margin: "0 0.4rem" }}>›</span>
            <span>Lição</span>
          </nav>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {/* Pomodoro Timer (shown when focus mode active) */}
            {focusActive && (
              <PomodoroTimer
                phase={pomodoroState.phase}
                secondsRemaining={pomodoroState.secondsRemaining}
                sessionCount={pomodoroState.sessionCount}
                focusDurationMinutes={focusDuration}
                onStart={start}
                onPause={pause}
                onSkipBreak={skipBreak}
                soundsEnabled={preferences?.soundEnabled ?? true}
              />
            )}

            {/* Focus mode toggle button */}
            <button
              className="btn-focus-mode"
              onClick={toggleFocus}
              aria-label={
                focusActive ? "Desativar modo foco" : "Ativar modo foco"
              }
              aria-pressed={focusActive}
              title="Modo Foco (tecla F)"
              style={{
                background: focusActive
                  ? "var(--color-primary)"
                  : "transparent",
                color: focusActive ? "#fff" : "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.375rem",
                padding: "0.35rem 0.75rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              🎯 {focusActive ? "Foco ativo" : "Modo Foco"}
            </button>
          </div>
        </div>

        {/* Break overlay */}
        <BreakScreen
          phase={pomodoroState.phase}
          secondsRemaining={pomodoroState.secondsRemaining}
          onSkip={skipBreak}
        />

        {/* ContentPlayer */}
        <div
          className="content-player"
          style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}
        >
          <MicrolearningBanner durationMinutes={lessonDurationMinutes} />
          <ContentPlayer
            lessonId={lessonId}
            courseId={courseId}
            apiBaseUrl={API_URL}
            accessToken={accessToken}
            animationsEnabled={preferences?.animationsEnabled ?? true}
            hasNext={!!nextLesson}
            hasPrev={!!prevLesson}
            onNext={
              nextLesson ? () => navigateToLesson(nextLesson.id) : undefined
            }
            onPrev={
              prevLesson ? () => navigateToLesson(prevLesson.id) : undefined
            }
            onComplete={handleComplete}
          />
        </div>
      </div>

      {/* Sensory panel — always accessible */}
      <SensoryPanel />
    </div>
  );
}

// ─── Page (provides FocusMode context) ────────────────────────────────────────

export default function LessonPage() {
  return (
    <FocusMode>
      <LessonPageInner />
    </FocusMode>
  );
}
