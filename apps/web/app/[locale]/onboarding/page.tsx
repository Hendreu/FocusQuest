"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth/auth-store";
import {
  type OnboardingState,
  type SensoryAnswers,
  mapAnswersToSensoryProfile,
} from "./_types";
import { StepIndicator } from "./_components/StepIndicator";
import { StepWelcome } from "./_components/StepWelcome";
import { StepAvatarSelection } from "./_components/StepAvatarSelection";
import { StepSensoryProfile } from "./_components/StepSensoryProfile";
import { StepFirstTrail } from "./_components/StepFirstTrail";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function OnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user, accessToken, setAuth } = useAuthStore();

  const [state, setState] = useState<OnboardingState>({
    step: 1,
    preferredName: user?.name || "",
    selectedCharacter: "character-1",
    selectedAccessory: "none",
    sensoryAnswers: {
      prefersMovement: null,
      soundHelpsConcentration: null,
      prefersShortSessions: null,
    },
    selectedCourseId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkip = () => {
    router.push(`/${locale}`);
  };

  const handleComplete = async (courseId: string | null) => {
    if (!accessToken || !user) {
      router.push(`/${locale}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const sensoryProfile = mapAnswersToSensoryProfile(state.sensoryAnswers);
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };

      const promises: Promise<Response>[] = [];

      // Update name if changed
      if (state.preferredName && state.preferredName !== user.name) {
        promises.push(
          fetch(`${API_URL}/users/me`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ name: state.preferredName }),
          }),
        );
      }

      // 1. Update preferences (sensory profile)
      promises.push(
        fetch(`${API_URL}/users/me/preferences`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            sensoryProfile,
            animationsEnabled: !sensoryProfile.reducedMotion,
            soundEnabled: sensoryProfile.soundEnabled,
            fontSize: sensoryProfile.fontSize,
          }),
        }),
      );

      // 2. Equip avatar
      // Assuming endpoint is POST /avatar/equip with proper body
      promises.push(
        fetch(`${API_URL}/avatar/equip`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            baseCharacter: state.selectedCharacter,
            items:
              state.selectedAccessory !== "none"
                ? [state.selectedAccessory]
                : [],
          }),
        }),
      );

      // 3. Mark onboarding as completed
      promises.push(
        fetch(`${API_URL}/users/me/onboarding`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ onboarding_completed: true }),
        }),
      );

      await Promise.all(promises);

      // Update local state
      setAuth(
        {
          ...user,
          name: state.preferredName || user.name,
          onboardingCompleted: true,
        },
        accessToken,
      );

      // Redirect
      if (courseId) {
        router.push(`/${locale}/courses/${courseId}`);
      } else {
        router.push(`/${locale}`);
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      router.push(`/${locale}`); // graceful fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextWelcome = (name: string) => {
    setState((s) => ({ ...s, preferredName: name, step: 2 }));
  };

  const handleNextAvatar = (characterId: string, accessorySlug: string) => {
    setState((s) => ({
      ...s,
      selectedCharacter: characterId as OnboardingState["selectedCharacter"],
      selectedAccessory: accessorySlug,
      step: 3,
    }));
  };

  const handleNextSensory = (answers: SensoryAnswers) => {
    setState((s) => ({ ...s, sensoryAnswers: answers, step: 4 }));
  };

  const handleBack = () => {
    setState((s) => ({ ...s, step: (s.step - 1) as OnboardingState["step"] }));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg, #f3f4f6)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          borderRadius: "16px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          padding: "32px",
          opacity: isSubmitting ? 0.7 : 1,
          pointerEvents: isSubmitting ? "none" : "auto",
        }}
      >
        <StepIndicator currentStep={state.step} totalSteps={4} />

        {state.step === 1 && (
          <StepWelcome
            defaultName={state.preferredName}
            onNext={handleNextWelcome}
            onSkip={handleSkip}
          />
        )}

        {state.step === 2 && (
          <StepAvatarSelection
            onNext={handleNextAvatar}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        )}

        {state.step === 3 && (
          <StepSensoryProfile
            onNext={handleNextSensory}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        )}

        {state.step === 4 && (
          <StepFirstTrail
            onComplete={handleComplete}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        )}
      </div>
    </div>
  );
}
