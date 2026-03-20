'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/auth-store';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDurationEstimate } from '@/hooks/useDurationEstimate';
import { CourseModuleTree } from '@/features/creator/CourseModuleTree';
import { LessonPreview } from '@/features/creator/LessonPreview';

// Editors
import { TextEditor } from '@/features/creator/editors/TextEditor';
import { VideoEditor } from '@/features/creator/editors/VideoEditor';
import { QuizEditor } from '@/features/creator/editors/QuizEditor';
import { CodeEditor } from '@/features/creator/editors/CodeEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Lesson {
  id: string;
  title: string;
  contentType: 'text' | 'video' | 'quiz' | 'code';
  content: unknown;
}

export default function LessonEditorPage({ params }: { params: { locale: string; courseId: string; lessonId: string } }) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (!accessToken) return;
    
    const fetchLesson = async () => {
      try {
        const res = await fetch(`${API_URL}/lessons/${params.lessonId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
          setTitle(data.title || '');
          setContent(data.content || getDefaultContent(data.contentType));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [params.lessonId, accessToken]);

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text': return '';
      case 'video': return { sourceType: 'upload', url: '' };
      case 'quiz': return [];
      case 'code': return { language: 'python', starter_code: '', solution: '', tests: [] };
      default: return null;
    }
  };

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // Auto-save title immediately (or could debounce this too)
    if (!accessToken) return;
    try {
      await fetch(`${API_URL}/lessons/${params.lessonId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ title: newTitle })
      });
    } catch (err) {
      console.error('Failed to save title', err);
    }
  };

  const { status: saveStatus } = useAutoSave(params.lessonId, content, accessToken);
  const duration = useDurationEstimate(lesson?.contentType || 'text', content);

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Salvando...';
      case 'saved': return 'Salvo ✓';
      case 'error': return 'Erro ao salvar';
      default: return 'Salvo ✓'; // Idle
    }
  };

  const renderEditor = () => {
    if (!lesson) return null;
    switch (lesson.contentType) {
      case 'text':
        return <TextEditor content={content as string} onChange={setContent} />;
      case 'video':
        return <VideoEditor content={content as Parameters<typeof VideoEditor>[0]['content']} onChange={setContent} />;
      case 'quiz':
        return <QuizEditor content={content as Parameters<typeof QuizEditor>[0]['content']} onChange={setContent} />;
      case 'code':
        return <CodeEditor content={content as Parameters<typeof CodeEditor>[0]['content']} onChange={setContent} />;
      default:
        return <div>Tipo de conteúdo não suportado.</div>;
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando...</div>;
  if (!lesson) return <div style={{ padding: '2rem' }}>Lição não encontrada.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface, #f8fafc)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', backgroundColor: 'var(--color-primary-light, #e0f2fe)', color: 'var(--color-primary-dark, #0369a1)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
            {lesson.contentType}
          </span>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            style={{ fontSize: '1.25rem', fontWeight: 'bold', border: 'none', background: 'transparent', outline: 'none', borderBottom: '1px dashed var(--color-border)' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Duração: ~{duration}min</span>
          <span style={{ fontSize: '0.875rem', color: saveStatus === 'error' ? 'var(--color-danger, #ef4444)' : 'var(--color-muted)' }}>{getSaveStatusText()}</span>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: showPreview ? 'var(--color-surface, #e2e8f0)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            👁 Preview
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: '300px', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', overflowY: 'auto' }}>
          <CourseModuleTree courseId={params.courseId} currentLessonId={params.lessonId} locale={params.locale} />
        </aside>

        {/* Editor Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: showPreview && lesson.contentType !== 'text' ? 'column' : 'row', overflowY: 'auto' }}>
          <div style={{ flex: 1, padding: '2rem', maxWidth: showPreview ? '50%' : '1000px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
            {renderEditor()}
          </div>
          {showPreview && (
            <div style={{ flex: 1, borderLeft: '1px solid var(--color-border)', padding: '2rem', backgroundColor: 'var(--color-surface, #f8fafc)', overflowY: 'auto' }}>
              <LessonPreview contentType={lesson.contentType} content={content} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
