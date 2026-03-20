'use client'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Institution {
  id: string
  name: string
  licenseSeats: number
}

interface StatsData {
  seats_used: number
  seats_total: number
}

export default function SettingsPage() {
  const { accessToken } = useAuthStore()
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInstitutionAndStats() {
      try {
        const res = await fetch(`${API_URL}/institutions`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (res.ok) {
          const data = await res.json()
          const instList = data.data || data
          if (Array.isArray(instList) && instList.length > 0) {
            const instId = instList[0].id
            
            // fetch detailed inst
            const detailRes = await fetch(`${API_URL}/institutions/${instId}`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (detailRes.ok) {
              const detailData = await detailRes.json()
              setInstitution(detailData)
            }

            // fetch stats for seats used
            const statsRes = await fetch(`${API_URL}/institutions/${instId}/stats`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (statsRes.ok) {
              const statsData = await statsRes.json()
              setStats(statsData)
            }
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchInstitutionAndStats()
  }, [accessToken])

  if (loading) return <div>Carregando...</div>
  if (!institution) return <div>Sem instituição vinculada.</div>

  const seatsUsed = stats?.seats_used ?? 0
  const seatsTotal = stats?.seats_total ?? institution.licenseSeats ?? 0
  const usagePercentage = seatsTotal > 0 ? (seatsUsed / seatsTotal) * 100 : 0
  const isNearLimit = usagePercentage > 90

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--color-text, #0f172a)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Configurações</h1>

      <div style={{ 
        background: 'var(--color-surface, #f8fafc)', 
        border: '1px solid var(--color-border, #e2e8f0)',
        padding: '2rem',
        borderRadius: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Detalhes da Instituição</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-muted, #64748b)' }}>Nome</label>
            <input 
              type="text" 
              value={institution.name || ''} 
              readOnly 
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border, #e2e8f0)',
                background: 'var(--color-background, #f1f5f9)',
                color: 'var(--color-text, #0f172a)',
                outline: 'none',
                maxWidth: '400px'
              }}
            />
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Uso da Licença</h2>
          <p style={{ color: 'var(--color-muted, #64748b)', marginBottom: '1rem' }}>
            Seats usados: {seatsUsed} / {seatsTotal}
          </p>

          <div style={{ width: '100%', maxWidth: '400px', height: '8px', background: 'var(--color-background, #f1f5f9)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ 
              width: `${Math.min(usagePercentage, 100)}%`, 
              height: '100%', 
              background: isNearLimit ? '#ef4444' : 'var(--color-primary, #3b82f6)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {isNearLimit && (
            <div style={{ 
              padding: '1rem', 
              background: '#fef3c7', 
              color: '#92400e', 
              borderRadius: '0.5rem', 
              border: '1px solid #fde68a',
              marginBottom: '1rem',
              maxWidth: '400px'
            }}>
              <strong>Atenção:</strong> Quase no limite! Contate-nos para expandir.
            </div>
          )}

          <a 
            href="mailto:upgrade@focusquest.com"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'var(--color-primary, #3b82f6)',
              color: '#fff',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Solicitar upgrade
          </a>
        </div>
      </div>
    </div>
  )
}