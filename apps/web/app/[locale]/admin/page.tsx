'use client'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'
import { StatCard } from '@/features/admin/StatCard'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface TopStudent {
  user_id: string
  name: string | null
  level: number
  xp: number
}

interface StatsData {
  active_students: number
  avg_progress_percent: number
  active_streaks_count: number
  badges_earned_this_week: number
  top_students: TopStudent[]
  atRiskStudents?: TopStudent[]
}

export default function AdminDashboard() {
  const { accessToken } = useAuthStore()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInstitution() {
      try {
        // Just fetching the current user to see if they have institutionId maybe?
        // Let's query /institutions or user profile.
        // I will do GET /institutions (assuming it lists institutions for the user)
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
      } finally {
        setLoading(false)
      }
    }
    fetchInstitution()
  }, [accessToken])

  useEffect(() => {
    if (!institutionId) return
    async function fetchStats() {
      try {
        const res = await fetch(`${API_URL}/institutions/${institutionId}/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [institutionId, accessToken])

  if (loading) return <div>Carregando...</div>
  if (!institutionId) return <div>Sem instituição vinculada.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--color-text, #0f172a)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard da Instituição</h1>
      
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <StatCard title="Alunos Ativos" value={stats.active_students ?? 0} icon="👥" />
          <StatCard title="Progresso Médio" value={`${stats.avg_progress_percent ?? 0}%`} icon="📈" />
          <StatCard title="Ofensivas Ativas" value={stats.active_streaks_count ?? 0} icon="🔥" />
          <StatCard title="Badges na Semana" value={stats.badges_earned_this_week ?? 0} icon="🏆" />
        </div>
      ) : (
        <div>Carregando estatísticas...</div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', background: 'var(--color-surface, #f8fafc)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border, #e2e8f0)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Top alunos</h2>
          {stats?.top_students && stats.top_students.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stats.top_students.map((student) => (
                <li key={student.user_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--color-background, #f1f5f9)', borderRadius: '0.5rem' }}>
                  <span>{student.name || 'Sem nome'} (Lvl {student.level})</span>
                  <span style={{ fontWeight: 'bold' }}>{student.xp} XP</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--color-muted, #64748b)' }}>Nenhum aluno em destaque ainda.</p>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '300px', background: 'var(--color-surface, #f8fafc)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--color-border, #e2e8f0)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ef4444' }}>Alunos em risco</h2>
          {stats?.atRiskStudents && stats.atRiskStudents.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {stats.atRiskStudents.map((student) => (
                <li key={student.user_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--color-background, #f1f5f9)', borderRadius: '0.5rem' }}>
                  <span>{student.name || 'Sem nome'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--color-muted, #64748b)' }}>Nenhum aluno em risco no momento.</p>
          )}
        </div>
      </div>
    </div>
  )
}