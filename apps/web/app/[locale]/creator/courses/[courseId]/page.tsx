'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/auth-store';
import { CourseModuleTree } from '@/features/creator/CourseModuleTree';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: 'draft' | 'review' | 'published' | 'archived';
  _count?: { modules: number };
}

export default function CourseEditorPage({ params }: { params: { locale: string; courseId: string } }) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${API_URL}/courses/${params.courseId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
          setTitle(data.title || '');
          setDescription(data.description || '');
          setThumbnailUrl(data.thumbnailUrl || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [params.courseId, accessToken]);

  const handleSaveBasicInfo = async () => {
    if (!accessToken) return;
    try {
      await fetch(`${API_URL}/courses/${params.courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ title, description, thumbnailUrl })
      });
      alert('Informações salvas!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar.');
    }
  };

  const handleSubmitReview = async () => {
    if (!accessToken || !course) return;
    
    // Simplistic check for modules
    if (course._count?.modules === 0) {
      alert('Crie pelo menos 1 módulo antes de submeter.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/courses/${params.courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: 'review' })
      });
      if (res.ok) {
        setCourse({ ...course, status: 'review' });
        alert('Curso submetido para revisão com sucesso!');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao submeter.');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando...</div>;
  if (!course) return <div style={{ padding: '2rem' }}>Curso não encontrado.</div>;

  const isEditable = course.status === 'draft';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface, #f8fafc)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isEditable}
            style={{ fontSize: '1.5rem', fontWeight: 'bold', border: 'none', background: 'transparent', outline: 'none', padding: '0.25rem', borderBottom: isEditable ? '1px dashed var(--color-border)' : 'none' }}
          />
          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: 'var(--color-surface, #e2e8f0)', fontSize: '0.75rem', fontWeight: 600 }}>
            {course.status.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push(`/${params.locale}/creator`)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: 'transparent', cursor: 'pointer' }}>
            Voltar
          </button>
          {isEditable && (
            <>
              <button onClick={handleSaveBasicInfo} style={{ padding: '0.5rem 1rem', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '0.25rem', backgroundColor: 'transparent', cursor: 'pointer' }}>
                Salvar Alterações
              </button>
              <button onClick={handleSubmitReview} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.25rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-background)', cursor: 'pointer' }}>
                Submeter para revisão
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{ width: '300px', borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', overflowY: 'auto' }}>
          <CourseModuleTree courseId={params.courseId} locale={params.locale} />
        </aside>

        {/* Editor Area */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', backgroundColor: 'var(--color-surface, #f8fafc)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--color-background)', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Informações do Curso</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isEditable}
                rows={6}
                style={{ padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>URL da Thumbnail</label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                disabled={!isEditable}
                style={{ padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)' }}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {thumbnailUrl && (
                <div style={{ marginTop: '0.5rem', width: '200px', aspectRatio: '16/9', border: '1px solid var(--color-border)', borderRadius: '0.25rem', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnailUrl} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
