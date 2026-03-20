'use client'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function InvitePage() {
  const { accessToken } = useAuthStore()
  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
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
      } finally {
        setLoading(false)
      }
    }
    fetchInstitution()
  }, [accessToken])

  const handleGenerate = async () => {
    if (!institutionId) return
    try {
      const res = await fetch(`${API_URL}/institutions/${institutionId}/invite`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'student' })
      })
      if (res.ok) {
        const data = await res.json()
        const url = `${window.location.origin}/invite?token=${data.token}`
        setInviteUrl(url)
      } else {
        const errData = await res.json()
        alert(`Erro: ${errData.error || 'Falha ao gerar convite'}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopy = () => {
    if (inviteUrl) {
      void navigator.clipboard.writeText(inviteUrl)
      alert('Copiado para a área de transferência!')
    }
  }

  if (!institutionId && !loading) return <div>Sem instituição vinculada.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--color-text, #0f172a)', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Gerar Convite</h1>

      <div style={{ 
        background: 'var(--color-surface, #f8fafc)', 
        border: '1px solid var(--color-border, #e2e8f0)',
        padding: '2rem',
        borderRadius: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <p style={{ color: 'var(--color-muted, #64748b)' }}>
          Gere um link para convidar novos alunos para a sua instituição. O link expira em 7 dias.
        </p>

        <button 
          onClick={() => { void handleGenerate() }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--color-primary, #3b82f6)',
            color: '#fff',
            borderRadius: '0.5rem',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          Gerar link de convite
        </button>

        {inviteUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Link de convite</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                readOnly 
                value={inviteUrl} 
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  background: 'var(--color-background, #f1f5f9)',
                  color: 'var(--color-text, #0f172a)',
                  outline: 'none'
                }}
              />
              <button 
                onClick={handleCopy}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--color-background, #f1f5f9)',
                  color: 'var(--color-text, #0f172a)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--color-border, #e2e8f0)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Copiar
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted, #64748b)' }}>Expira em 7 dias</span>
          </div>
        )}
      </div>
    </div>
  )
}