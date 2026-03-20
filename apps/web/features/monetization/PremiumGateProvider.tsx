'use client'

import React from 'react'
import { UpgradeModal } from './UpgradeModal'
import { usePremiumGateStore } from '../../hooks/usePremiumGate'

export function PremiumGateProvider({ children }: { children: React.ReactNode }) {
  const { isOpen, reason, courseId, closeUpgradeModal } = usePremiumGateStore()

  return (
    <>
      {children}
      <UpgradeModal
        isOpen={isOpen}
        onClose={closeUpgradeModal}
        reason={reason}
        courseId={courseId}
      />
    </>
  )
}
