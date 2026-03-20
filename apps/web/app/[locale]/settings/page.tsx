"use client";

import { usePreferences } from "@/hooks/usePreferences";

export default function SettingsPage() {
  const { preferences, isLoading, updatePreferences } = usePreferences();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-extrabold text-text mb-8">
          Configurações
        </h1>

        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl shadow-md border border-border p-6 space-y-6"
          >
            <div className="h-6 w-32 bg-bg-muted rounded animate-pulse mb-4" />
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-9 w-20 bg-bg-muted rounded-xl animate-pulse" />
                <div className="h-9 w-20 bg-bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-9 w-20 bg-bg-muted rounded-xl animate-pulse" />
                <div className="h-9 w-20 bg-bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-extrabold text-text mb-8">Configurações</h1>

      <div className="bg-surface rounded-2xl shadow-md border border-border p-6 space-y-6">
        <h2 className="text-lg font-bold text-text mb-4">Aparência</h2>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted">Tema</span>
          <div className="flex gap-2">
            {(["light", "dark", "high-contrast"] as const).map((t) => (
              <button
                key={t}
                onClick={() => updatePreferences({ theme: t })}
                className={
                  preferences?.theme === t
                    ? "bg-primary text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all"
                    : "bg-bg-muted text-text hover:bg-bg-emphasis rounded-xl px-4 py-2 text-sm transition-all"
                }
              >
                {t === "light"
                  ? "Claro"
                  : t === "dark"
                    ? "Escuro"
                    : "Alto Contraste"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted">
            Tamanho da Fonte
          </span>
          <div className="flex gap-2">
            {(["normal", "large", "xlarge"] as const).map((size) => (
              <button
                key={size}
                onClick={() => updatePreferences({ font_size: size })}
                className={
                  preferences?.fontSize === size
                    ? "bg-primary text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all"
                    : "bg-bg-muted text-text hover:bg-bg-emphasis rounded-xl px-4 py-2 text-sm transition-all"
                }
              >
                {size === "normal"
                  ? "Normal"
                  : size === "large"
                    ? "Grande"
                    : "Extra Grande"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-md border border-border p-6 space-y-6">
        <h2 className="text-lg font-bold text-text mb-4">Acessibilidade</h2>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted">Animações</span>
          <div className="flex gap-2">
            {[true, false].map((val) => (
              <button
                key={val.toString()}
                onClick={() => updatePreferences({ animations_enabled: val })}
                className={
                  preferences?.animationsEnabled === val
                    ? "bg-primary text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all"
                    : "bg-bg-muted text-text hover:bg-bg-emphasis rounded-xl px-4 py-2 text-sm transition-all"
                }
              >
                {val ? "Ativadas" : "Desativadas"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl shadow-md border border-border p-6 space-y-6">
        <h2 className="text-lg font-bold text-text mb-4">Estudo</h2>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted">
            Duração do Foco
          </span>
          <div className="flex gap-2">
            {([15, 25, 45] as const).map((mins) => (
              <button
                key={mins}
                onClick={() =>
                  updatePreferences({ focus_duration_minutes: mins })
                }
                className={
                  preferences?.focusDurationMinutes === mins
                    ? "bg-primary text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all"
                    : "bg-bg-muted text-text hover:bg-bg-emphasis rounded-xl px-4 py-2 text-sm transition-all"
                }
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted">
            Duração da Pausa
          </span>
          <div className="flex gap-2">
            {([5, 10] as const).map((mins) => (
              <button
                key={mins}
                onClick={() =>
                  updatePreferences({ break_duration_minutes: mins })
                }
                className={
                  preferences?.sensoryProfile?.break_duration_minutes === mins
                    ? "bg-primary text-white font-semibold rounded-xl px-4 py-2 text-sm transition-all"
                    : "bg-bg-muted text-text hover:bg-bg-emphasis rounded-xl px-4 py-2 text-sm transition-all"
                }
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
