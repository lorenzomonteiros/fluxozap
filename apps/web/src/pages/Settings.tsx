import React, { useState } from 'react'
import { User, Lock, Save, Eye, EyeOff, Bell, Palette } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { useAuthStore } from '../stores/authStore'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { getInitials, formatDate } from '../lib/utils'

export const Settings: React.FC = () => {
  const { user } = useAuthStore()
  const { refreshUser } = useAuth()
  const { toast } = useToast()

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    avatarUrl: user?.avatarUrl ?? '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      await authService.updateProfile({
        name: profileForm.name.trim(),
        avatarUrl: profileForm.avatarUrl.trim() || null,
      })
      await refreshUser()
      toast({ message: 'Perfil atualizado!', variant: 'success' })
    } catch {
      toast({ message: 'Erro ao atualizar perfil', variant: 'error' })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast({ message: 'Preencha todos os campos', variant: 'warning' })
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ message: 'As senhas não coincidem', variant: 'error' })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ message: 'A nova senha deve ter pelo menos 8 caracteres', variant: 'warning' })
      return
    }
    setSavingPassword(true)
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast({ message: 'Senha alterada com sucesso!', variant: 'success' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      toast({ message: 'Senha atual incorreta', variant: 'error' })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-text-primary">Configurações</h1>
        <p className="text-text-secondary text-sm mt-1">Gerencie sua conta e preferências</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={16} className="text-gold" />
            <CardTitle>Perfil</CardTitle>
          </div>
          <Badge variant="secondary">{user?.email}</Badge>
        </CardHeader>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-2xl font-bold text-text-inverse shadow-glow">
              {user ? getInitials(user.name) : '?'}
            </div>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-text-primary">{user?.name}</h3>
            <p className="text-sm text-text-secondary">{user?.email}</p>
            {user?.createdAt && (
              <p className="text-xs text-text-muted mt-0.5">Membro desde {formatDate(user.createdAt)}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Nome"
            value={profileForm.name}
            onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
            fullWidth
          />
          <Input
            label="URL do avatar (opcional)"
            placeholder="https://..."
            value={profileForm.avatarUrl}
            onChange={(e) => setProfileForm((f) => ({ ...f, avatarUrl: e.target.value }))}
            fullWidth
            hint="Link direto para uma imagem"
          />
          <div className="flex justify-end">
            <Button
              icon={<Save size={14} />}
              loading={savingProfile}
              onClick={handleSaveProfile}
            >
              Salvar Perfil
            </Button>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-gold" />
            <CardTitle>Segurança</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <Input
            label="Senha atual"
            type={showCurrentPw ? 'text' : 'password'}
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
            fullWidth
            rightIcon={
              <button onClick={() => setShowCurrentPw(!showCurrentPw)} type="button" className="text-text-muted hover:text-text-secondary transition-colors">
                {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
          <Input
            label="Nova senha"
            type={showNewPw ? 'text' : 'password'}
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
            fullWidth
            hint="Mínimo 8 caracteres, uma maiúscula e um número"
            rightIcon={
              <button onClick={() => setShowNewPw(!showNewPw)} type="button" className="text-text-muted hover:text-text-secondary transition-colors">
                {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            }
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            fullWidth
          />
          <div className="flex justify-end">
            <Button
              icon={<Lock size={14} />}
              loading={savingPassword}
              onClick={handleChangePassword}
            >
              Alterar Senha
            </Button>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-gold" />
            <CardTitle>Aparência</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">Tema atual: <span className="text-gold font-medium">Dark Premium</span></p>
          <div className="flex gap-3">
            <div className="w-12 h-8 rounded-lg bg-background border-2 border-gold cursor-pointer" title="Dark" />
            <div className="w-12 h-8 rounded-lg bg-white border-2 border-border cursor-not-allowed opacity-30" title="Light (em breve)" />
          </div>
          <p className="text-xs text-text-muted">Mais temas em breve.</p>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-gold" />
            <CardTitle>Notificações</CardTitle>
          </div>
          <Badge variant="secondary">Em breve</Badge>
        </CardHeader>
        <p className="text-sm text-text-secondary">
          Configure notificações por email e push para eventos importantes como desconexão de instâncias e falhas em fluxos.
        </p>
      </Card>

      {/* Danger Zone */}
      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="text-danger">Zona de Perigo</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Ações irreversíveis que afetam permanentemente sua conta.
          </p>
          <Button variant="danger" size="sm">
            Excluir Conta
          </Button>
        </div>
      </Card>
    </div>
  )
}
