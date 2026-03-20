"use client";

import { useTranslations } from "next-intl";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const t = useTranslations("onboarding");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "14px", color: "#94a3b8" }}>
          {t("stepIndicator", { current: currentStep, total: totalSteps })}
        </span>
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index + 1 === currentStep;
          const isPast = index + 1 < currentStep;

          return (
            <div
              key={index}
              style={{
                height: "6px",
                flex: 1,
                borderRadius: "999px",
                backgroundColor: isActive || isPast ? "#3b82f6" : "#334155",
                opacity: isActive ? 1 : isPast ? 0.6 : 1,
                transition: "all 0.2s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
