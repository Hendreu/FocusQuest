import React, { useState, useEffect, useRef } from 'react'
import type { CodeContent } from '@repo/types'
import { useCodeExecution } from '../hooks/useCodeExecution'

// CodeMirror — lazy-loaded to avoid SSR issues
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'

interface CodeLessonProps {
  content: CodeContent
  lessonId: string
  apiBaseUrl: string
  accessToken: string | null
  onComplete?: () => void
}

export function CodeLesson({
  content,
  apiBaseUrl,
  accessToken,
  onComplete,
}: CodeLessonProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [code, setCode] = useState(content.starterCode)
  const { output, isRunning, hasPassedAllTests, execute } = useCodeExecution(apiBaseUrl, accessToken)
  const [completedFired, setCompletedFired] = useState(false)

  // Mount CodeMirror
  useEffect(() => {
    if (!editorRef.current) return

    const langExtension =
      content.language === 'python' ? python() : javascript({ typescript: content.language === 'typescript' })

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        setCode(update.state.doc.toString())
      }
    })

    const state = EditorState.create({
      doc: content.starterCode,
      extensions: [
        oneDark,
        langExtension,
        keymap.of(defaultKeymap),
        updateListener,
        EditorView.lineWrapping,
      ],
    })

    const view = new EditorView({ state, parent: editorRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.starterCode, content.language])

  // Fire onComplete when all tests pass
  useEffect(() => {
    if (hasPassedAllTests && !completedFired) {
      setCompletedFired(true)
      onComplete?.()
    }
  }, [hasPassedAllTests, completedFired, onComplete])

  function handleRun() {
    void execute(content.language, code)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Tests list (static descriptions) */}
      {content.tests.length > 0 && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Testes</p>
          {content.tests.map((test, i) => {
            const result = output?.testResults[i]
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span>{result ? (result.passed ? '✅' : '❌') : '⬜'}</span>
                <span>{test.description}</span>
                {result && !result.passed && result.expected && (
                  <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                    esperado: {result.expected}, obtido: {result.actual}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* CodeMirror editor */}
      <div
        ref={editorRef}
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '0.375rem',
          overflow: 'hidden',
          minHeight: '200px',
          fontSize: '0.9rem',
        }}
      />

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={isRunning}
        style={{
          alignSelf: 'flex-start',
          padding: '0.6rem 1.5rem',
          background: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: isRunning ? 'wait' : 'pointer',
          fontWeight: 600,
          opacity: isRunning ? 0.7 : 1,
        }}
      >
        {isRunning ? '⏳ Executando...' : '▶ Executar'}
      </button>

      {/* Output area */}
      {output && (
        <div style={{ background: '#1e1e1e', borderRadius: '0.375rem', padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {output.stdout && (
            <pre style={{ color: '#d4d4d4', margin: 0, whiteSpace: 'pre-wrap' }}>{output.stdout}</pre>
          )}
          {output.stderr && (
            <pre style={{ color: '#f87171', margin: 0, marginTop: output.stdout ? '0.5rem' : 0, whiteSpace: 'pre-wrap' }}>{output.stderr}</pre>
          )}
          {!output.stdout && !output.stderr && (
            <p style={{ color: '#6b7280', margin: 0 }}>(sem output)</p>
          )}
        </div>
      )}
    </div>
  )
}
