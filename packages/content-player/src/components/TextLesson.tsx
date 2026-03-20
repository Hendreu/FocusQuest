import React, { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { TextContent } from '@repo/types'

interface TextLessonProps {
  content: TextContent
  onProgressChange?: (pct: number) => void
}

function estimatedReadMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function TextLesson({ content, onProgressChange }: TextLessonProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function handleScroll() {
      if (!el) return
      const scrolled = window.scrollY + window.innerHeight
      const total = el.offsetTop + el.scrollHeight
      const pct = Math.min(100, (scrolled / total) * 100)
      if (pct >= 80 && onProgressChange) onProgressChange(100)
      else if (onProgressChange) onProgressChange(pct)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onProgressChange])

  const readMinutes = estimatedReadMinutes(content.markdown)

  return (
    <div ref={containerRef} style={{ maxWidth: '72ch', margin: '0 auto', lineHeight: 1.7 }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
        Leitura estimada: ~{readMinutes} min
      </p>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className ?? '')
            const inline = !match
            return inline ? (
              <code
                style={{
                  background: 'var(--color-code-bg, #1e1e1e)',
                  color: 'var(--color-code-text, #d4d4d4)',
                  padding: '0.1em 0.4em',
                  borderRadius: '0.25em',
                  fontSize: '0.875em',
                }}
                {...props}
              >
                {children}
              </code>
            ) : (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
          // Callout blocks via blockquote: :::note, :::warning, :::tip
          blockquote({ children }) {
            return (
              <blockquote
                style={{
                  borderLeft: '4px solid var(--color-primary)',
                  margin: '1rem 0',
                  padding: '0.75rem 1rem',
                  background: 'var(--color-surface)',
                  borderRadius: '0 0.375rem 0.375rem 0',
                }}
              >
                {children}
              </blockquote>
            )
          },
          img({ src, alt }) {
            // eslint-disable-next-line @next/next/no-img-element
            return (
              <img
                src={src}
                alt={alt ?? ''}
                loading="lazy"
                style={{ maxWidth: '100%', borderRadius: '0.375rem' }}
              />
            )
          },
        }}
      >
        {content.markdown}
      </ReactMarkdown>
    </div>
  )
}
