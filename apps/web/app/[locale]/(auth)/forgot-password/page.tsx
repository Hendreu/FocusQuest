'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ForgotPasswordPage() {
  const params = useParams()
  const locale = (params?.locale as string) ?? 'pt-BR'

  return (
    <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow-lg p-8 text-center">
      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">Esqueceu sua senha?</h2>
      <p className="text-[var(--color-text-secondary)] text-sm mb-6">
        A recuperação de senha por e-mail estará disponível em breve.
        <br />
        Por enquanto, entre com sua conta Google ou entre em contato com o suporte.
      </p>
      <Link
        href={`/${locale}/login`}
        className="inline-block px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity"
      >
        Voltar para o login
      </Link>
    </div>
  )
}
