'use client';

import { useState } from 'react';

interface CodeTest {
  name: string;
  assert: string;
}

interface CodeContent {
  language: string;
  starter_code: string;
  solution: string;
  tests: CodeTest[];
}

interface CodeEditorProps {
  content: CodeContent | null;
  onChange: (content: CodeContent) => void;
}

export function CodeEditor({ content, onChange }: CodeEditorProps) {
  const [data, setData] = useState<CodeContent>({
    language: content?.language || 'python',
    starter_code: content?.starter_code || '',
    solution: content?.solution || '',
    tests: content?.tests || [],
  });

  const handleChange = (field: keyof CodeContent, value: string | CodeTest[]) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const addTest = () => {
    handleChange('tests', [...data.tests, { name: '', assert: '' }]);
  };

  const updateTest = (index: number, updates: Partial<CodeTest>) => {
    const newTests = [...data.tests];
    newTests[index] = { ...newTests[index], ...updates };
    handleChange('tests', newTests);
  };

  const removeTest = (index: number) => {
    const newTests = data.tests.filter((_, i) => i !== index);
    handleChange('tests', newTests);
  };

  const textareaStyle = {
    fontFamily: 'monospace',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: '1rem',
    borderRadius: '0.25rem',
    border: '1px solid var(--color-border)',
    width: '100%',
    minHeight: '200px',
    resize: 'vertical' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'var(--color-surface, #f8fafc)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Linguagem</label>
        <select
          value={data.language}
          onChange={(e) => handleChange('language', e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', width: 'fit-content' }}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Código Base (Starter Code)</label>
        <textarea
          value={data.starter_code}
          onChange={(e) => handleChange('starter_code', e.target.value)}
          style={textareaStyle}
          spellCheck={false}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontWeight: 500, fontSize: '0.875rem' }}>Solução</label>
        <textarea
          value={data.solution}
          onChange={(e) => handleChange('solution', e.target.value)}
          style={textareaStyle}
          spellCheck={false}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 500, fontSize: '1rem' }}>Testes</span>
          <button
            type="button"
            onClick={addTest}
            style={{ padding: '0.5rem 1rem', border: '1px dashed var(--color-border)', borderRadius: '0.25rem', color: 'var(--color-primary)' }}
          >
            + Adicionar teste
          </button>
        </div>

        {data.tests.map((test, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem', backgroundColor: 'var(--color-background)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Teste {index + 1}</span>
              <button type="button" onClick={() => removeTest(index)} style={{ color: 'var(--color-danger, #ef4444)' }}>X Remover</button>
            </div>
            
            <input
              type="text"
              value={test.name}
              onChange={(e) => updateTest(index, { name: e.target.value })}
              placeholder="Nome do teste (ex: soma(1, 2) deve retornar 3)"
              style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '0.25rem' }}
            />
            
            <textarea
              value={test.assert}
              onChange={(e) => updateTest(index, { assert: e.target.value })}
              placeholder="Código de asserção (ex: assert soma(1, 2) == 3)"
              style={{ ...textareaStyle, minHeight: '80px' }}
              spellCheck={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
