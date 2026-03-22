import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'

const registerFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerFormSchema>

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { register: authRegister, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerFormSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authRegister(data.name, data.email, data.password)
    } catch {
      // Error handled in useAuth
    }
  }

  return (
    <Card className="w-full">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary mb-1">Criar conta</h1>
        <p className="text-text-secondary text-sm">Comece gratuitamente por 14 dias</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome completo"
          placeholder="João Silva"
          fullWidth
          leftIcon={<User size={15} />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          fullWidth
          leftIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 8 caracteres"
          fullWidth
          leftIcon={<Lock size={15} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar senha"
          type={showConfirm ? 'text' : 'password'}
          placeholder="••••••••"
          fullWidth
          leftIcon={<Lock size={15} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <p className="text-xs text-text-muted">
          Ao criar uma conta, você concorda com nossos{' '}
          <a href="#" className="text-gold hover:underline">Termos de Serviço</a>
          {' '}e{' '}
          <a href="#" className="text-gold hover:underline">Política de Privacidade</a>.
        </p>

        <Button type="submit" fullWidth loading={isLoading} size="lg">
          Criar conta
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-text-secondary">
        Já tem conta?{' '}
        <Link to="/login" className="text-gold hover:text-gold-soft transition-colors font-medium">
          Entrar
        </Link>
      </p>
    </Card>
  )
}
