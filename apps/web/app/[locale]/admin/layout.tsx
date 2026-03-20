'use client'

import React from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  const params = useParams()
  const locale = (params?.locale as string) ?? 'pt-BR'

  if (user?.role !== 'institution_admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text)' }}>
        Acesso restrito a administradores institucionais.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        borderRight: '1px solid var(--color-border)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--color-surface, #f8fafc)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', padding: '0 1rem', color: 'var(--color-text)' }}>
          FocusQuest Admin
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href={`/${locale}/admin`} style={linkStyle}>Dashboard</Link>
          <Link href={`/${locale}/admin/students`} style={linkStyle}>Alunos</Link>
          <Link href={`/${locale}/admin/classes`} style={linkStyle}>Turmas</Link>
          <Link href={`/${locale}/admin/invite`} style={linkStyle}>Convite</Link>
          <Link href={`/${locale}/admin/settings`} style={linkStyle}>Configurações</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto', color: 'var(--color-text)' }}>
        {children}
      </main>
    </div>
  )
}

const linkStyle = {
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  color: 'var(--color-text)',
  fontWeight: 500,
  transition: 'background-color 0.2s',
  display: 'block'
}
