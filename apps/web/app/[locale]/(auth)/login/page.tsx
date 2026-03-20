"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuthStore } from "../../../../lib/auth/auth-store";

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "pt-BR";
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(LoginSchema) });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const json = (await res.json()) as {
        accessToken?: string;
        user?: Parameters<typeof setAuth>[0];
        error?: string;
      };

      if (!res.ok) {
        setServerError(json.error ?? "Erro ao entrar. Tente novamente.");
        return;
      }

      setAuth(json.user!, json.accessToken!);

      const user = json.user!;
      if (!user.onboardingCompleted) {
        router.push(`/${locale}/onboarding`);
      } else if (user.role === "student") {
        router.push(`/${locale}`);
      } else {
        router.push(`/${locale}/admin`);
      }
    } catch {
      setServerError("Erro de conexão. Verifique sua internet.");
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Entrar</h2>

      {serverError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 p-4 rounded-xl bg-error/10 text-error text-sm border border-error/20 flex items-center gap-2"
        >
          ⚠️ {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            {...register("email")}
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1 text-xs text-error"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-describedby={errors.password ? "password-error" : undefined}
            aria-invalid={!!errors.password}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            {...register("password")}
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              className="mt-1 text-xs text-error"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="text-right">
          <Link
            href={`/${locale}/forgot-password`}
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            Esqueci minha senha
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
        >
          {isSubmitting ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="text-xs text-gray-400 bg-white px-3">ou</span>
        </div>
      </div>

      <a
        href={`${API_URL}/auth/google`}
        className="flex items-center justify-center gap-3 w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:shadow-md transition-all"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Entrar com Google
      </a>

      <p className="mt-8 text-center text-sm text-gray-500">
        Não tem conta?{" "}
        <Link
          href={`/${locale}/register`}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
