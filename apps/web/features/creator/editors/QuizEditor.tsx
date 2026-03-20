'use client';

import { useState } from 'react';
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

interface QuizOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false';
  options: QuizOption[];
}

interface QuizEditorProps {
  content: QuizQuestion[] | null;
  onChange: (content: QuizQuestion[]) => void;
}

function SortableQuestion({
  question,
  index,
  updateQuestion,
  removeQuestion,
  addOption,
  updateOption,
  removeOption,
}: {
  question: QuizQuestion;
  index: number;
  updateQuestion: (id: string, updates: Partial<QuizQuestion>) => void;
  removeQuestion: (id: string) => void;
  addOption: (questionId: string) => void;
  updateOption: (questionId: string, optionIndex: number, updates: Partial<QuizOption>) => void;
  removeOption: (questionId: string, optionIndex: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    border: '1px solid var(--color-border)',
    borderRadius: '0.5rem',
    backgroundColor: 'var(--color-surface, #f8fafc)',
    marginBottom: '1rem',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '0.5rem', color: 'var(--color-muted)' }}>
        ⠿
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Pergunta {index + 1}</span>
          <button type="button" onClick={() => removeQuestion(question.id)} style={{ color: 'var(--color-danger, #ef4444)' }}>
            X Remover
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem' }}>Texto da Pergunta</label>
          <input
            type="text"
            value={question.text}
            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
            style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem' }}>Tipo</label>
          <select
            value={question.type}
            onChange={(e) => updateQuestion(question.id, { type: e.target.value as 'multiple_choice' | 'true_false' })}
            style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
          >
            <option value="multiple_choice">Múltipla Escolha</option>
            <option value="true_false">Verdadeiro ou Falso</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Opções</span>
          {question.options.map((option, optIdx) => (
            <div key={optIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: 'var(--color-background)' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={(e) => updateOption(question.id, optIdx, { isCorrect: e.target.checked })}
                />
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(question.id, optIdx, { text: e.target.value })}
                  placeholder="Texto da opção"
                  style={{ flex: 1, padding: '0.25rem 0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
                />
                <button type="button" onClick={() => removeOption(question.id, optIdx)} style={{ color: 'var(--color-danger, #ef4444)' }}>X</button>
              </div>
              <input
                type="text"
                value={option.explanation || ''}
                onChange={(e) => updateOption(question.id, optIdx, { explanation: e.target.value })}
                placeholder="Explicação (opcional)"
                style={{ marginLeft: '2rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', color: 'var(--color-muted)' }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addOption(question.id)}
            style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', border: '1px dashed var(--color-border)', borderRadius: '0.25rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}
          >
            + Adicionar opção
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuizEditor({ content, onChange }: QuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(content || []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addQuestion = () => {
    const newQuestions = [
      ...questions,
      {
        id: `q_${Date.now()}`,
        text: '',
        type: 'multiple_choice' as const,
        options: [{ text: '', isCorrect: false }],
      },
    ];
    setQuestions(newQuestions);
    onChange(newQuestions);
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    const newQuestions = questions.map((q) => (q.id === id ? { ...q, ...updates } : q));
    setQuestions(newQuestions);
    onChange(newQuestions);
  };

  const removeQuestion = (id: string) => {
    const newQuestions = questions.filter((q) => q.id !== id);
    setQuestions(newQuestions);
    onChange(newQuestions);
  };

  const addOption = (questionId: string) => {
    const newQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, { text: '', isCorrect: false }] };
      }
      return q;
    });
    setQuestions(newQuestions);
    onChange(newQuestions);
  };

  const updateOption = (questionId: string, optionIndex: number, updates: Partial<QuizOption>) => {
    const newQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuestions(newQuestions);
    onChange(newQuestions);
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const newQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuestions(newQuestions);
    onChange(newQuestions);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        onChange(newOrder);
        return newOrder;
      });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          {questions.map((q, i) => (
            <SortableQuestion
              key={q.id}
              question={q}
              index={i}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
              addOption={addOption}
              updateOption={updateOption}
              removeOption={removeOption}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addQuestion}
        style={{
          padding: '1rem',
          border: '2px dashed var(--color-border)',
          borderRadius: '0.5rem',
          color: 'var(--color-primary)',
          fontWeight: 'bold',
          cursor: 'pointer',
          backgroundColor: 'transparent'
        }}
      >
        + Adicionar pergunta
      </button>
    </div>
  );
}
