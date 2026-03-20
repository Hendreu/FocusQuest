import { create } from 'zustand'
import { UpgradeReason } from '../features/monetization/UpgradeModal'

interface PremiumGateState {
  isOpen: boolean
  reason: UpgradeReason
  courseId?: string
  openUpgradeModal: (reason: UpgradeReason, courseId?: string) => void
  closeUpgradeModal: () => void
}

export const usePremiumGateStore = create<PremiumGateState>((set) => ({
  isOpen: false,
  reason: null,
  courseId: undefined,
  openUpgradeModal: (reason, courseId) => set({ isOpen: true, reason, courseId }),
  closeUpgradeModal: () => set({ isOpen: false, reason: null, courseId: undefined }),
}))

export function usePremiumGate() {
  const store = usePremiumGateStore()

  return {
    isUpgradeOpen: store.isOpen,
    upgradeReason: store.reason,
    openUpgradeModal: store.openUpgradeModal,
    closeUpgradeModal: store.closeUpgradeModal,
  }
}
