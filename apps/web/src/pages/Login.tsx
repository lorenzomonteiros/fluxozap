import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'

const loginFormSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginForm = z.infer<typeof loginFormSchema>

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
    } catch {
      // Error handled in useAuth
    }
  }

  return (
    <Card className="w-full">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-text-primary mb-1">Bem-vindo de volta</h1>
        <p className="text-text-secondary text-sm">Entre na sua conta FlowZap</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="••••••••"
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

        <div className="flex items-center justify-end">
          <a href="#" className="text-xs text-gold hover:text-gold-soft transition-colors">
            Esqueceu a senha?
          </a>
        </div>

        <Button type="submit" fullWidth loading={isLoading} size="lg">
          Entrar
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-text-secondary">
        Não tem conta?{' '}
        <Link to="/register" className="text-gold hover:text-gold-soft transition-colors font-medium">
          Criar conta grátis
        </Link>
      </p>
    </Card>
  )
}
