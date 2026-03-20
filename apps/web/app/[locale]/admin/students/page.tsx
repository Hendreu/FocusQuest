'use client'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'
import { StudentTable, Member } from '@/features/admin/StudentTable'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function StudentsPage() {
  const { accessToken } = useAuthStore()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
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
    if (!institutionId) return
    async function fetchMembers() {
      try {
        const res = await fetch(`${API_URL}/institutions/${institutionId}/members`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (res.ok) {
          const data = await res.json()
          setMembers(data.members || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [institutionId, accessToken])

  const handleRemove = async (userId: string) => {
    if (!institutionId) return
    try {
      const res = await fetch(`${API_URL}/institutions/${institutionId}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.userId !== userId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleViewProfile = (userId: string) => {
    const localeMatch = window.location.pathname.match(/^\/([^/]+)/)
    const locale = localeMatch ? localeMatch[1] : 'pt-BR'
    router.push(`/${locale}/admin/students/${userId}`)
  }

  const handleExportCSV = async () => {
    if (!institutionId) return
    try {
      const res = await fetch(`${API_URL}/institutions/${institutionId}/export/students-progress`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (!res.ok) throw new Error('Falha ao exportar')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'progresso-alunos.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Erro ao exportar CSV')
    }
  }

  const filteredMembers = members.filter(m => 
    (m.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (m.email?.toLowerCase() || '').includes(search.toLowerCase())
  )

  if (!institutionId && !loading) return <div>Sem instituição vinculada.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--color-text, #0f172a)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Gestão de Alunos</h1>
        <button 
          onClick={handleExportCSV}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-primary, #3b82f6)',
            color: '#fff',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Exportar CSV
        </button>
      </div>

      <div>
        <input 
          type="text" 
          placeholder="Buscar aluno por nome ou email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border, #e2e8f0)',
            outline: 'none',
            background: 'var(--color-surface, #fff)',
            color: 'var(--color-text, #0f172a)'
          }}
        />
      </div>

      {loading ? (
        <div>Carregando alunos...</div>
      ) : (
        <StudentTable 
          members={filteredMembers} 
          onRemove={handleRemove} 
          onViewProfile={handleViewProfile} 
        />
      )}
    </div>
  )
}
