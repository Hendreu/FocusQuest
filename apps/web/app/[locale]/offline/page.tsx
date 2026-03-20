'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginBottom: '1.5rem', opacity: 0.8 }}
      >
        <line x1="1" y1="1" x2="23" y2="23"></line>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
        <line x1="12" y1="20" x2="12.01" y2="20"></line>
      </svg>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Você está offline
      </h1>
      <p style={{ fontSize: '1.125rem', opacity: 0.8, marginBottom: '2rem' }}>
        Suas lições recentes estão disponíveis no cache.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--color-primary, #6C63FF)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          style={{
            padding: '0.75rem 1.5rem',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Ir ao início
        </Link>
      </div>
    </div>
  )
}