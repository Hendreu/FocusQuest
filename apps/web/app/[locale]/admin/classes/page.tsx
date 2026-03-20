'use client'
import React from 'react'

export default function ClassesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--color-text, #0f172a)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Gestão de Turmas</h1>
      
      <div style={{ 
        background: 'var(--color-surface, #f8fafc)', 
        border: '1px solid var(--color-border, #e2e8f0)',
        padding: '2rem',
        borderRadius: '1rem',
        textAlign: 'center',
        color: 'var(--color-muted, #64748b)'
      }}>
        <p style={{ fontSize: '1.125rem' }}>Gestão de turmas estará disponível em breve.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Estamos trabalhando nesta funcionalidade.</p>
      </div>
    </div>
  )
}