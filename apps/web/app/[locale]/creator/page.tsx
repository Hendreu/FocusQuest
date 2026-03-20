'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Course {
  id: string;
  title: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  _count?: { lessons: number };
  updatedAt: string;
}

export default function CreatorDashboard({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_URL}/courses?creatorId=me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [accessToken]);

  if (!user) return <div style={{ padding: '2rem' }}>Carregando...</div>;
  
  if (user.role !== 'creator') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-danger, #ef4444)' }}>
        <h2>Acesso restrito a criadores</h2>
        <p>Sua conta não tem permissão para acessar esta área.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: 'var(--color-success-light, #dcfce7)', color: 'var(--color-success, #16a34a)', fontSize: '0.75rem', fontWeight: 600 }}>Publicado</span>;
      case 'review':
        return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: 'var(--color-warning-light, #fef08a)', color: 'var(--color-warning-dark, #854d0e)', fontSize: '0.75rem', fontWeight: 600 }}>Em Revisão</span>;
      case 'archived':
        return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: 'var(--color-danger-light, #fee2e2)', color: 'var(--color-danger, #ef4444)', fontSize: '0.75rem', fontWeight: 600 }}>Arquivado</span>;
      default:
        return <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: 'var(--color-surface, #f1f5f9)', color: 'var(--color-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Rascunho</span>;
    }
  };

  const submitForReview = async (id: string) => {
    if (!accessToken) return;
    try {
      await fetch(`${API_URL}/courses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: 'review' })
      });
      // Refresh list
      const res = await fetch(`${API_URL}/courses?creatorId=me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (res.ok) setCourses(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const archiveCourse = async (id: string) => {
    if (!accessToken) return;
    try {
      await fetch(`${API_URL}/courses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: 'archived' })
      });
      // Refresh list
      const res = await fetch(`${API_URL}/courses?creatorId=me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (res.ok) setCourses(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Dashboard do Criador</h1>
        <button
          onClick={() => router.push(`/${params.locale}/creator/courses/new`)}
          style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-background)', borderRadius: '0.5rem', border: 'none', fontWeight: 600, cursor: 'pointer' }}
        >
          Criar novo curso
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-muted)' }}>Carregando cursos...</p>
      ) : (
        <div style={{ backgroundColor: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--color-surface, #f8fafc)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-muted)' }}>Título</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-muted)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-muted)' }}>Lições</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-muted)' }}>Última mod.</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-muted)', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                    Você ainda não criou nenhum curso.
                  </td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{course.title}</td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(course.status)}</td>
                    <td style={{ padding: '1rem' }}>{course._count?.lessons || 0}</td>
                    <td style={{ padding: '1rem', color: 'var(--color-muted)' }}>
                      {new Date(course.updatedAt).toLocaleDateString(params.locale === 'en' ? 'en-US' : 'pt-BR')}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {course.status === 'draft' && (
                          <>
                            <button
                              onClick={() => router.push(`/${params.locale}/creator/courses/${course.id}`)}
                              style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: 'transparent', cursor: 'pointer' }}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => submitForReview(course.id)}
                              style={{ padding: '0.25rem 0.75rem', border: 'none', borderRadius: '0.25rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-background)', cursor: 'pointer' }}
                            >
                              Submeter
                            </button>
                          </>
                        )}
                        {(course.status === 'review' || course.status === 'published') && (
                          <button
                            onClick={() => router.push(`/${params.locale}/creator/courses/${course.id}`)}
                            style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: 'transparent', cursor: 'pointer' }}
                          >
                            Ver
                          </button>
                        )}
                        {course.status === 'published' && (
                          <button
                            onClick={() => archiveCourse(course.id)}
                            style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--color-danger, #ef4444)', borderRadius: '0.25rem', backgroundColor: 'transparent', color: 'var(--color-danger, #ef4444)', cursor: 'pointer' }}
                          >
                            Arquivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
