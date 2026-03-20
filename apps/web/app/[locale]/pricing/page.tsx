'use client'

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button, Card, CardHeader, CardBody, CardFooter, Badge } from '@repo/design-system'
import { useAuthStore } from '../../../lib/auth/auth-store'

export default function PricingPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const { user, accessToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

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
          success_url: `${window.location.origin}/${locale}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
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
      alert('Erro ao iniciar o checkout. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentPlan = user?.plan || 'free'

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">
          Escolha o melhor plano para sua jornada
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)]">
          Aprenda no seu ritmo com ferramentas desenvolvidas para você.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* FREE */}
        <Card className="flex flex-col relative">
          {currentPlan === 'free' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="warning">Seu plano atual</Badge>
            </div>
          )}
          <CardHeader>
            <h3 className="text-2xl font-bold">Free</h3>
            <p className="text-3xl font-bold mt-4">R$ 0</p>
            <p className="text-[var(--color-text-secondary)]">Para sempre</p>
          </CardHeader>
          <CardBody className="flex-1">
            <ul className="flex flex-col gap-4">
              <li className="flex gap-2"><span>✅</span> 3 lições por curso</li>
              <li className="flex gap-2"><span>✅</span> 2 missões ativas</li>
              <li className="flex gap-2"><span>✅</span> Leaderboard básico</li>
              <li className="flex gap-2"><span>✅</span> 10 itens de avatar</li>
            </ul>
          </CardBody>
          <CardFooter>
            <Button
              className="w-full justify-center"
              variant="secondary"
              onClick={() => router.push('/pt-BR/register')}
              disabled={currentPlan !== 'free'}
            >
              {currentPlan === 'free' ? 'Plano atual' : 'Começar grátis'}
            </Button>
          </CardFooter>
        </Card>

        {/* INDIVIDUAL */}
        <Card className="flex flex-col relative border-2 border-[var(--color-primary)] shadow-lg scale-105">
          {currentPlan === 'premium_individual' ? (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="warning">Seu plano atual</Badge>
            </div>
          ) : (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="warning">⭐ POPULAR</Badge>
            </div>
          )}
          <CardHeader>
            <h3 className="text-2xl font-bold text-[var(--color-primary)]">Individual</h3>
            <p className="text-3xl font-bold mt-4">R$ 9,90<span className="text-lg font-normal">/mês</span></p>
            <p className="text-[var(--color-text-secondary)]">Desbloqueie tudo</p>
          </CardHeader>
          <CardBody className="flex-1">
            <ul className="flex flex-col gap-4 font-medium">
              <li className="flex gap-2"><span>✅</span> <b>Lições ilimitadas</b></li>
              <li className="flex gap-2"><span>✅</span> Todas as missões</li>
              <li className="flex gap-2"><span>✅</span> Avatares exclusivos</li>
              <li className="flex gap-2"><span>✅</span> Estatísticas avançadas</li>
            </ul>
          </CardBody>
          <CardFooter>
            {currentPlan === 'premium_individual' ? (
              <Button className="w-full justify-center" variant="secondary" disabled>
                Plano atual
              </Button>
            ) : (
              <Button
                className="w-full justify-center"
                variant="primary"
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? 'Redirecionando...' : 'Fazer upgrade'}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* INSTITUCIONAL */}
        <Card className="flex flex-col relative">
          {currentPlan === 'premium_institution' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="warning">Seu plano atual</Badge>
            </div>
          )}
          <CardHeader>
            <h3 className="text-2xl font-bold">Institucional</h3>
            <p className="text-3xl font-bold mt-4">Sob consulta</p>
            <p className="text-[var(--color-text-secondary)]">Para escolas e clínicas</p>
          </CardHeader>
          <CardBody className="flex-1">
            <ul className="flex flex-col gap-4">
              <li className="flex gap-2"><span>✅</span> Turmas ilimitadas</li>
              <li className="flex gap-2"><span>✅</span> Dashboard admin</li>
              <li className="flex gap-2"><span>✅</span> Exportar CSV</li>
              <li className="flex gap-2"><span>✅</span> Relatórios avançados</li>
            </ul>
          </CardBody>
          <CardFooter>
            <Button
              className="w-full justify-center"
              variant="secondary"
              onClick={() => { window.location.href = 'mailto:vendas@focusquest.app' }}
            >
              Falar com vendas
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
