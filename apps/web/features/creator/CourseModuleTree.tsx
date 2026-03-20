'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/auth-store';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Lesson {
  id: string;
  title: string;
  contentType: 'text' | 'video' | 'quiz' | 'code';
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseModuleTreeProps {
  courseId: string;
  currentLessonId?: string;
  locale?: string;
}

function SortableModule({
  module,
  expanded,
  onToggle,
  onAddLesson,
  currentLessonId,
  courseId,
  locale = 'pt-BR',
}: {
  module: Module;
  expanded: boolean;
  onToggle: () => void;
  onAddLesson: (moduleId: string) => void;
  currentLessonId?: string;
  courseId: string;
  locale?: string;
}) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: '0.5rem',
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'video': return '🎬';
      case 'quiz': return '❓';
      case 'code': return '💻';
      default: return '📄';
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem',
        backgroundColor: 'var(--color-surface, #f8fafc)',
        border: '1px solid var(--color-border)',
        borderRadius: '0.375rem',
        cursor: 'pointer',
      }}>
        <div {...attributes} {...listeners} style={{ padding: '0 0.5rem', cursor: 'grab', color: 'var(--color-muted)' }}>
          ⠿
        </div>
        <div onClick={onToggle} style={{ flex: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{expanded ? '▼' : '▶'}</span>
          {module.title}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddLesson(module.id);
          }}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-background)', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
        >
          + Lição
        </button>
      </div>

      {expanded && (
        <div style={{ paddingLeft: '2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {module.lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => router.push(`/${locale}/creator/courses/${courseId}/lessons/${lesson.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: lesson.id === currentLessonId ? 'var(--color-primary-light, #e0f2fe)' : 'transparent',
                border: lesson.id === currentLessonId ? '1px solid var(--color-primary)' : '1px solid transparent',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: lesson.id === currentLessonId ? 'var(--color-primary-dark, #0369a1)' : 'var(--color-foreground)'
              }}
            >
              <span>{getIcon(lesson.contentType)}</span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</span>
            </div>
          ))}
          {module.lessons.length === 0 && (
            <div style={{ padding: '0.5rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              Nenhuma lição neste módulo
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CourseModuleTree({ courseId, currentLessonId, locale = 'pt-BR' }: CourseModuleTreeProps) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('text');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchModules = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/courses/${courseId}/curriculum`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setModules(data || []);
        
        // Expand all modules by default
        const initialExpanded: Record<string, boolean> = {};
        data?.forEach((m: Module) => { initialExpanded[m.id] = true; });
        setExpandedModules(initialExpanded);
      }
    } catch (err) {
      console.error('Failed to fetch modules', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [courseId, accessToken]);

  const handleAddModule = async () => {
    if (!accessToken) return;
    const title = prompt('Nome do novo módulo:');
    if (!title) return;

    try {
      const res = await fetch(`${API_URL}/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ title, order: modules.length })
      });
      if (res.ok) {
        await fetchModules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLesson = async () => {
    if (!accessToken || !selectedModuleId || !newLessonTitle) return;

    try {
      const res = await fetch(`${API_URL}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          title: newLessonTitle,
          contentType: newLessonType,
        })
      });

      if (res.ok) {
        const data = await res.json();
        setShowLessonModal(false);
        setNewLessonTitle('');
        setNewLessonType('text');
        router.push(`/${locale}/creator/courses/${courseId}/lessons/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);

      const newModules = arrayMove(modules, oldIndex, newIndex);
      setModules(newModules);

      if (!accessToken) return;
      try {
        await fetch(`${API_URL}/modules/${active.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ order: newIndex })
        });
      } catch (err) {
        console.error(err);
        fetchModules(); // Revert on error
      }
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return <div style={{ padding: '1rem', color: 'var(--color-muted)' }}>Carregando módulos...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Currículo</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchModules} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer' }}>
            Recarregar
          </button>
          <button onClick={handleAddModule} style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', borderRadius: '0.25rem', border: '1px solid transparent', backgroundColor: 'var(--color-primary)', color: 'var(--color-background)', cursor: 'pointer' }}>
            + Módulo
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
            {modules.map((module) => (
              <SortableModule
                key={module.id}
                module={module}
                expanded={expandedModules[module.id] ?? false}
                onToggle={() => toggleModule(module.id)}
                currentLessonId={currentLessonId}
                courseId={courseId}
                locale={locale}
                onAddLesson={(moduleId) => {
                  setSelectedModuleId(moduleId);
                  setShowLessonModal(true);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {showLessonModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--color-background)',
            padding: '2rem',
            borderRadius: '0.5rem',
            width: '100%',
            maxWidth: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Nova Lição</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Título</label>
              <input
                type="text"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Tipo de Conteúdo</label>
              <select
                value={newLessonType}
                onChange={(e) => setNewLessonType(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)' }}
              >
                <option value="text">📝 Texto / Artigo</option>
                <option value="video">🎬 Vídeo</option>
                <option value="quiz">❓ Quiz</option>
                <option value="code">💻 Código</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => setShowLessonModal(false)}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--color-border)', backgroundColor: 'transparent', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateLesson}
                disabled={!newLessonTitle.trim()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-background)',
                  cursor: newLessonTitle.trim() ? 'pointer' : 'not-allowed',
                  opacity: newLessonTitle.trim() ? 1 : 0.5
                }}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
