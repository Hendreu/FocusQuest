import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave(lessonId: string, content: unknown, accessToken: string | null) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const initialRender = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    setStatus('saving');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (!accessToken) {
        setStatus('error');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/lessons/${lessonId}/content`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error('Failed to save');
        }

        setStatus('saved');
      } catch (err) {
        console.error('Error auto-saving:', err);
        setStatus('error');
      }
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lessonId, content, accessToken]);

  return { status };
}
