'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/auth/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface NewCourseFormData {
  title: string;
  description: string;
  language: string;
}

export default function NewCoursePage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewCourseFormData>({
    defaultValues: {
      language: 'pt-BR'
    }
  });

  const onSubmit = async (data: NewCourseFormData) => {
    if (!accessToken) return;

    try {
      const res = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        const course = await res.json();
        router.push(`/${params.locale}/creator/courses/${course.id}`);
      } else {
        alert('Erro ao criar curso.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao criar curso.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', padding: '2rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'var(--color-surface, #f8fafc)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Criar Novo Curso</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Título *</label>
          <input
            {...register('title', { required: 'Título é obrigatório' })}
            type="text"
            style={{ padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)' }}
          />
          {errors.title && <span style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.75rem' }}>{errors.title.message}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Descrição</label>
          <textarea
            {...register('description')}
            rows={4}
            style={{ padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Idioma</label>
          <select
            {...register('language')}
            style={{ padding: '0.75rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)' }}
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en">English</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.25rem',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-background)',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Criando...' : 'Criar Curso'}
          </button>
        </div>
      </form>
    </div>
  );
}
