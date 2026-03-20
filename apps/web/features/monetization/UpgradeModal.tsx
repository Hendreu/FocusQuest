'use client'

import React, { useState } from 'react'
import { Modal, ModalContent, Button } from '@repo/design-system'
import { useAuthStore } from '../../lib/auth/auth-store'

export type UpgradeReason = 'lesson_limit' | 'premium_content' | 'premium_quest' | 'premium_avatar' | null

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason: UpgradeReason
  courseId?: string
}

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { accessToken } = useAuthStore()

  const handleUpgrade = async () => {
    try {
      setIsLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
      
      const response = await fetch(`${API_URL}/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          success_url: `${window.location.origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      // We could show a toast here, but simple alert for now
      alert('Erro ao iniciar o checkout. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  const getReasonTitle = () => {
    switch (reason) {
      case 'lesson_limit':
        return 'Limite de lições atingido'
      case 'premium_content':
        return 'Conteúdo exclusivo Premium'
      case 'premium_quest':
        return 'Missão Premium'
      case 'premium_avatar':
        return 'Item de Avatar Premium'
      default:
        return 'Faça o upgrade para Premium'
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent
        title="🚀 Continue aprendendo sem limites"
        description={getReasonTitle()}
      >
        <div className="flex flex-col gap-6 py-4">
          <p className="text-[var(--color-text-secondary)]">
            Você chegou ao limite do plano free. Desbloqueie todo o potencial da plataforma com o Premium:
          </p>

          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>Lições ilimitadas</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>Missões premium</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>Avatares exclusivos</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>Estatísticas avançadas</span>
            </li>
          </ul>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              variant="primary"
              className="w-full justify-center"
              size="lg"
            >
              {isLoading ? 'Carregando...' : 'Fazer upgrade — R$9,90/mês'}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full justify-center text-[var(--color-text-secondary)]"
            >
              Continuar no plano free
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}
