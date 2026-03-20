"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuthStore } from "../../../../lib/auth/auth-store";

const RegisterSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(255),
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve ter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve ter pelo menos um número"),
    confirmPassword: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof RegisterSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "pt-BR";
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    mode: "onChange",
  });

  async function onSubmit(data: RegisterFormData) {
    setServerError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const json = (await res.json()) as {
        accessToken?: string;
        user?: Parameters<typeof setAuth>[0];
        error?: string;
      };

      if (!res.ok) {
        setServerError(json.error ?? "Erro ao criar conta. Tente novamente.");
        return;
      }

      setAuth(json.user!, json.accessToken!);
      router.push(`/${locale}/onboarding`);
    } catch {
      setServerError("Erro de conexão. Verifique sua internet.");
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar conta</h2>

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
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Nome
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={!!errors.name}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            {...register("name")}
          />
          {errors.name && (
            <p
              id="name-error"
              role="alert"
              aria-live="polite"
              className="mt-1 text-xs text-error"
            >
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
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
              aria-live="polite"
              className="mt-1 text-xs text-error"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
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
            autoComplete="new-password"
            aria-describedby={errors.password ? "password-error" : undefined}
            aria-invalid={!!errors.password}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            {...register("password")}
          />
          {errors.password && (
            <p
              id="password-error"
              role="alert"
              aria-live="polite"
              className="mt-1 text-xs text-error"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-describedby={
              errors.confirmPassword ? "confirm-error" : undefined
            }
            aria-invalid={!!errors.confirmPassword}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p
              id="confirm-error"
              role="alert"
              aria-live="polite"
              className="mt-1 text-xs text-error"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
        >
          {isSubmitting ? "Criando conta…" : "Criar conta"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        Já tem conta?{" "}
        <Link
          href={`/${locale}/login`}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
