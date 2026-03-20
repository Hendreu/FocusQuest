import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(255),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve ter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve ter pelo menos um número'),
  inviteToken: z.string().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
