'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Button, Card, CardBody, Badge } from '@repo/design-system'
import { useAuthStore } from '../../../../lib/auth/auth-store'
import { motion } from 'framer-motion'

export default function UpgradeSuccessPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const sessionId = searchParams.get('session_id')
  
  const { user, accessToken, setAuth } = useAuthStore()
  const [isVerifying, setIsVerifying] = useState(true)
  const [retries, setRetries] = useState(0)

  useEffect(() => {
    if (!sessionId) {
      router.push(`/${locale}/dashboard`)
      return
    }

    const verifyPlan = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
        const response = await fetch(`${API_URL}/billing/status`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.plan === 'premium_individual') {
            if (user && accessToken) {
              setAuth({ ...user, plan: 'premium_individual' }, accessToken)
            }
            setIsVerifying(false)
            return
          }
        }
        
        // Plan not updated yet, retry
        if (retries < 3) {
          setTimeout(() => {
            setRetries(r => r + 1)
          }, 2000)
        } else {
          setIsVerifying(false)
        }
      } catch (err) {
        console.error('Error verifying plan:', err)
        setIsVerifying(false)
      }
    }

    verifyPlan()
  }, [retries, sessionId, accessToken, locale, router, user, setAuth])

  if (isVerifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin text-4xl">🔄</div>
          <p className="text-lg text-[var(--color-text-secondary)]">Verificando seu upgrade...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center relative overflow-hidden">
        {/* Confetti / stars background effect */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 500, opacity: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-[20%] text-2xl"
          >⭐</motion.div>
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 500, opacity: 1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
            className="absolute left-[50%] text-3xl"
          >🎉</motion.div>
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 500, opacity: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
            className="absolute left-[80%] text-xl"
          >✨</motion.div>
        </div>

        <CardBody className="flex flex-col items-center gap-6 py-12 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-6xl mb-2"
          >
            🎉
          </motion.div>
          
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Bem-vindo ao Premium!
          </h1>
          
          <div className="flex justify-center my-2">
            <Badge variant="success" size="md" className="text-lg py-2 px-4 shadow-sm">
              Premium Member ⭐
            </Badge>
          </div>
          
          <p className="text-[var(--color-text-secondary)]">
            Seu upgrade foi concluído com sucesso. Agora você tem acesso ilimitado a todas as lições, missões e itens exclusivos!
          </p>

          <Button
            size="lg"
            variant="primary"
            className="w-full mt-4"
            onClick={() => router.push(`/${locale}/dashboard`)}
          >
            Continuar aprendendo
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
