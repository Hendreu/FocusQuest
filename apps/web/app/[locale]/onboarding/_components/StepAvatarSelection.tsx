"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface StepAvatarSelectionProps {
  onNext: (characterId: string, accessorySlug: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

const CHARACTERS = [
  { id: "character-1", color: "#fca5a5", icon: "🦊" },
  { id: "character-2", color: "#93c5fd", icon: "🐰" },
  { id: "character-3", color: "#86efac", icon: "🐱" },
  { id: "character-4", color: "#fde047", icon: "🐼" },
];

const ACCESSORIES = [
  { id: "none", label: "Nenhum" },
  { id: "glasses", label: "Óculos" },
  { id: "hat", label: "Chapéu" },
  { id: "cape", label: "Capa" },
];

export function StepAvatarSelection({
  onNext,
  onBack,
  onSkip,
}: StepAvatarSelectionProps) {
  const t = useTranslations("onboarding");
  const [character, setCharacter] = useState<string>(CHARACTERS[0].id);
  const [accessory, setAccessory] = useState<string>("none");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}
        >
          {t("step2.title")}
        </h1>
        <p style={{ color: "#94a3b8" }}>{t("step2.subtitle")}</p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {CHARACTERS.map((c) => {
          const isSelected = character === c.id;
          return (
            <div
              key={c.id}
              data-char={c.id}
              onClick={() => setCharacter(c.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                borderRadius: "12px",
                border: isSelected ? "2px solid #818cf8" : "2px solid #334155",
                backgroundColor: c.color,
                cursor: "pointer",
                fontSize: "48px",
                transition: "all 0.2s ease",
                opacity: isSelected ? 1 : 0.7,
              }}
            >
              {c.icon}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: "8px",
        }}
      >
        <label style={{ fontSize: "14px", fontWeight: 500 }}>
          {t("step2.chooseAccessory")}
        </label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {ACCESSORIES.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccessory(a.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border:
                  accessory === a.id
                    ? "1px solid #818cf8"
                    : "1px solid #334155",
                backgroundColor: accessory === a.id ? "#4f46e5" : "transparent",
                color: accessory === a.id ? "#f8fafc" : "#f8fafc",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: accessory === a.id ? 600 : 400,
                transition: "all 0.2s",
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onBack}
            style={{
              flex: 1,
              padding: "14px 24px",
              borderRadius: "8px",
              backgroundColor: "transparent",
              border: "1px solid #334155",
              color: "#f8fafc",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {t("back")}
          </button>
          <button
            onClick={() => onNext(character, accessory)}
            style={{
              flex: 2,
              padding: "14px 24px",
              borderRadius: "8px",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("continue")}
          </button>
        </div>

        <button
          onClick={onSkip}
          style={{
            padding: "12px",
            backgroundColor: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {t("skip")}
        </button>
      </div>
    </div>
  );
}
