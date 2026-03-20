"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface StepFirstTrailProps {
  onComplete: (courseId: string | null) => void;
  onBack: () => void;
  onSkip: () => void;
}

const COURSES = [
  {
    id: "intro-programacao",
    title: "Introdução à Programação",
    level: "Iniciante",
    duration: "~2h",
    icon: "💻",
  },
  {
    id: "logica-matematica",
    title: "Lógica Matemática",
    level: "Intermediário",
    duration: "~3h",
    icon: "🧮",
  },
  {
    id: "pensamento-computacional",
    title: "Pensamento Computacional",
    level: "Avançado",
    duration: "~4h",
    icon: "🧠",
  },
];

export function StepFirstTrail({
  onComplete,
  onBack,
  onSkip,
}: StepFirstTrailProps) {
  const t = useTranslations("onboarding");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}
        >
          {t("step4.title")}
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {COURSES.map((course) => {
          const isSelected = selectedCourseId === course.id;
          return (
            <div
              key={course.id}
              onClick={() => setSelectedCourseId(isSelected ? null : course.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px",
                borderRadius: "12px",
                border: isSelected ? "2px solid #818cf8" : "1px solid #334155",
                backgroundColor: isSelected ? "#4f46e5" : "#1e293b",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ fontSize: "32px" }}>{course.icon}</div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#f8fafc",
                    margin: "0 0 4px 0",
                  }}
                >
                  {course.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    fontSize: "12px",
                    color: "#94a3b8",
                  }}
                >
                  <span>{course.level}</span>
                  <span>•</span>
                  <span>{course.duration}</span>
                </div>
              </div>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  border: isSelected
                    ? "6px solid #3b82f6"
                    : "2px solid #334155",
                  backgroundColor: "#1e293b",
                  transition: "all 0.2s",
                }}
              />
            </div>
          );
        })}
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
            onClick={() => onComplete(selectedCourseId)}
            style={{
              flex: 2,
              padding: "14px 24px",
              borderRadius: "8px",
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {selectedCourseId ? t("step4.begin") : t("step4.toDashboard")}
          </button>
        </div>
      </div>
    </div>
  );
}
