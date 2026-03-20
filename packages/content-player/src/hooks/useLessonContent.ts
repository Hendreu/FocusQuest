import { useState, useEffect } from "react";
import type { Lesson, LessonContent } from "@repo/types";

interface UseLessonContentResult {
  lesson: Lesson | null;
  content: LessonContent | null;
  isLoading: boolean;
  error: string | null;
}

export function useLessonContent(
  lessonId: string,
  apiBaseUrl: string,
  accessToken: string | null,
): UseLessonContentResult {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [content, setContent] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function fetchAll() {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

        // The /lessons/:id/content endpoint returns { lesson, content } directly
        const contentRes = await fetch(
          `${apiBaseUrl}/lessons/${lessonId}/content`,
          { headers },
        );

        if (!contentRes.ok)
          throw new Error(`Failed to load content: ${contentRes.status}`);

        const data = (await contentRes.json()) as {
          lesson: Lesson;
          content: LessonContent;
        };

        if (!cancelled) {
          setLesson(data.lesson);
          setContent(data.content);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unknown error loading lesson",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchAll();
    return () => {
      cancelled = true;
    };
  }, [lessonId, apiBaseUrl, accessToken]);

  return { lesson, content, isLoading, error };
}
