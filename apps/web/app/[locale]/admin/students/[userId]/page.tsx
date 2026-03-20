'use client'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface StudentProgress {
  id: string
  userId: string
  name: string | null
  email: string | null
  totalXp: number
  level: number
  currentStreak: number
  badgesCount: number
  progressByCourse: { name?: string; lessonsCompleted?: number }[]
}

export default function StudentProfilePage() {
  const { accessToken } = useAuthStore()
  const params = useParams()
  const userId = params?.userId as string
  const locale = (params?.locale as string) ?? 'pt-BR'

  const [student, setStudent] = useState<StudentProgress | null>(null)
  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInstitution() {
      try {
        const res = await fetch(`${API_URL}/institutions`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.data && data.data.length > 0) {
            setInstitutionId(data.data[0].id)
          } else if (Array.isArray(data) && data.length > 0) {
            setInstitutionId(data[0].id)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchInstitution()
  }, [accessToken])

  useEffect(() => {
    if (!institutionId || !userId) return
    async function fetchStudentProgress() {
      try {
        const res = await fetch(`${API_URL}/institutions/${institutionId}/students/${userId}/progress`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (res.ok) {
          const data = await res.json()
          setStudent(data.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudentProgress()
  }, [institutionId, userId, accessToken])

  if (!institutionId && !loading) return <div>Sem instituição vinculada.</div>
  if (loading) return <div>Carregando perfil...</div>
  if (!student) return <div>Aluno não encontrado.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--color-text, #0f172a)' }}>
      <div>
        <Link 
          href={`/${locale}/admin/students`} 
          style={{ color: 'var(--color-primary, #3b82f6)', textDecoration: 'none', fontWeight: 600, marginBottom: '1rem', display: 'inline-block' }}
        >
          ← Voltar para a lista
        </Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Perfil do Aluno</h1>
      </div>

      <div style={{ 
        background: 'var(--color-surface, #f8fafc)', 
        padding: '2rem', 
        borderRadius: '1rem', 
        border: '1px solid var(--color-border, #e2e8f0)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{student.name || 'Sem nome'}</h2>
          <p style={{ color: 'var(--color-muted, #64748b)' }}>{student.email}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div style={statBoxStyle}>
            <span style={statLabelStyle}>Nível</span>
            <span style={statValueStyle}>{student.level ?? 1}</span>
          </div>
          <div style={statBoxStyle}>
            <span style={statLabelStyle}>XP Total</span>
            <span style={statValueStyle}>{student.totalXp ?? 0}</span>
          </div>
          <div style={statBoxStyle}>
            <span style={statLabelStyle}>Ofensiva</span>
            <span style={statValueStyle}>{student.currentStreak ?? 0} 🔥</span>
          </div>
          <div style={statBoxStyle}>
            <span style={statLabelStyle}>Badges</span>
            <span style={statValueStyle}>{student.badgesCount ?? 0} 🏆</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Progresso por curso</h3>
          {(!student.progressByCourse || student.progressByCourse.length === 0) ? (
            <p style={{ color: 'var(--color-muted, #64748b)' }}>Nenhum progresso registrado.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {student.progressByCourse.map((course, idx) => (
                <li key={idx} style={{ padding: '1rem', background: 'var(--color-background, #f1f5f9)', borderRadius: '0.5rem' }}>
                  {course.name || 'Curso desconhecido'} - {course.lessonsCompleted || 0} lições
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

const statBoxStyle: React.CSSProperties = {
  background: 'var(--color-background, #f1f5f9)',
  padding: '1rem',
  borderRadius: '0.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem'
}

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--color-muted, #64748b)',
  fontWeight: 600
}

const statValueStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: 'var(--color-text, #0f172a)'
}