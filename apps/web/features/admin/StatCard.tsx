'use client'
import React from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--color-surface, #f8fafc)',
      border: '1px solid var(--color-border, #e2e8f0)',
      borderRadius: '1rem',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-muted, #64748b)' }}>{title}</h3>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-text, #0f172a)' }}>{value}</div>
        {trend && (
          <span style={{ 
            fontSize: '0.875rem', 
            fontWeight: 600,
            color: trend === 'up' ? 'var(--color-primary, #3b82f6)' : trend === 'down' ? '#ef4444' : 'var(--color-muted, #64748b)'
          }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      {subtitle && <div style={{ fontSize: '0.875rem', color: 'var(--color-muted, #64748b)' }}>{subtitle}</div>}
    </div>
  )
}
