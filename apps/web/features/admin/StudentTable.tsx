'use client'
import React from 'react'

export interface Member {
  id: string
  userId: string
  name: string | null
  email: string | null
  role: string
  joinedAt: string | null
  lessonsCompleted?: number
  totalXp?: number
  level?: number
  currentStreak?: number
}

interface StudentTableProps {
  members: Member[]
  onRemove: (userId: string) => void
  onViewProfile: (userId: string) => void
}

export function StudentTable({ members, onRemove, onViewProfile }: StudentTableProps) {
  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      background: 'var(--color-surface, #f8fafc)',
      borderRadius: '1rem',
      border: '1px solid var(--color-border, #e2e8f0)',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: 'var(--color-background, #f1f5f9)', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
          <tr>
            <th style={thStyle}>Nome</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Lições</th>
            <th style={thStyle}>XP</th>
            <th style={thStyle}>Nível</th>
            <th style={thStyle}>Ofensiva</th>
            <th style={thStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted, #64748b)' }}>
                Nenhum aluno encontrado.
              </td>
            </tr>
          ) : (
            members.map((m) => (
              <tr key={m.userId} style={{ borderBottom: '1px solid var(--color-border, #e2e8f0)' }}>
                <td style={tdStyle}>{m.name || 'Sem nome'}</td>
                <td style={tdStyle}>{m.email || 'Sem email'}</td>
                <td style={tdStyle}>{m.lessonsCompleted ?? 0}</td>
                <td style={tdStyle}>{m.totalXp ?? 0}</td>
                <td style={tdStyle}>{m.level ?? 1}</td>
                <td style={tdStyle}>{m.currentStreak ?? 0} 🔥</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => onViewProfile(m.userId)}
                      style={{ ...btnStyle, background: 'var(--color-primary, #3b82f6)', color: '#fff' }}
                    >
                      Ver perfil
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja remover este aluno?')) {
                          onRemove(m.userId)
                        }
                      }}
                      style={{ ...btnStyle, background: '#ef4444', color: '#fff' }}
                    >
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '1rem',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: 'var(--color-muted, #64748b)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const tdStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '0.875rem',
  color: 'var(--color-text, #0f172a)'
}

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '0.25rem',
  border: 'none',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
}