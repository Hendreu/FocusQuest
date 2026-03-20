'use client';

interface LessonPreviewProps {
  contentType: string;
  content: unknown;
}

export function LessonPreview({ contentType, content }: LessonPreviewProps) {
  const renderPreview = () => {
    switch (contentType) {
      case 'text': {
        const textContent = typeof content === 'string' ? content : '';
        return (
          <div
            dangerouslySetInnerHTML={{ __html: textContent || '<p>Nenhum conteúdo</p>' }}
            style={{ padding: '1rem' }}
          />
        );
      }
      case 'video': {
        const videoContent = content as { sourceType?: string; url?: string };
        if (!videoContent?.url) return <p style={{ padding: '1rem', color: 'var(--color-muted)' }}>Nenhum vídeo selecionado</p>;
        
        if (videoContent.sourceType === 'embed') {
          return (
            <div style={{ padding: '1rem', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>
              Preview iframe: {videoContent.url}
            </div>
          );
        }
        return (
          <div style={{ padding: '1rem' }}>
            <video controls src={videoContent.url} style={{ width: '100%', borderRadius: '0.5rem' }} />
          </div>
        );
      }
      case 'quiz': {
        const quizContent = content as Array<{ text: string; options: Array<{ text: string; isCorrect: boolean; explanation?: string }> }>;
        if (!Array.isArray(quizContent) || quizContent.length === 0) {
          return <p style={{ padding: '1rem', color: 'var(--color-muted)' }}>Nenhuma pergunta</p>;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
            {quizContent.map((q, i) => (
              <div key={i} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem' }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>{i + 1}. {q.text}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options?.map((opt, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: opt.isCorrect ? 'var(--color-success-light, #dcfce7)' : 'var(--color-surface, #f8fafc)' }}>
                      <input type="radio" disabled checked={opt.isCorrect} />
                      <span style={{ color: opt.isCorrect ? 'var(--color-success, #16a34a)' : 'inherit' }}>{opt.text}</span>
                      {opt.explanation && <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginLeft: 'auto' }}>({opt.explanation})</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }
      case 'code': {
        const codeContent = content as { language?: string; starter_code?: string };
        return (
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--color-muted)' }}>{codeContent?.language || 'python'}</div>
            <pre style={{ padding: '1rem', backgroundColor: '#1e1e1e', color: '#d4d4d4', borderRadius: '0.25rem', overflowX: 'auto' }}>
              <code>{codeContent?.starter_code || '# Nenhum código base'}</code>
            </pre>
          </div>
        );
      }
      default:
        return <p style={{ padding: '1rem', color: 'var(--color-muted)' }}>Preview não suportado</p>;
    }
  };

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: '0.5rem',
      backgroundColor: 'var(--color-background)',
      overflow: 'hidden',
      marginTop: '1.5rem'
    }}>
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface, #f8fafc)',
        fontWeight: 600
      }}>
        Preview
      </div>
      {renderPreview()}
    </div>
  );
}
