import React from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  Workflow,
  Users,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Bot,
  BarChart3,
  Globe,
  Shield,
  Webhook,
  Smartphone,
  Star,
  ChevronRight,
} from 'lucide-react'
import { Button } from '../components/ui/Button'

const features = [
  {
    icon: <Workflow size={24} />,
    title: 'Visual Flow Builder',
    description:
      'Build complex automation flows with an intuitive drag-and-drop editor. No coding required.',
  },
  {
    icon: <Bot size={24} />,
    title: 'AI-Powered Automation',
    description:
      'Smart conditional logic, keyword triggers, and automated responses that feel human.',
  },
  {
    icon: <Users size={24} />,
    title: 'CRM Integration',
    description:
      'Full contact management with tags, custom variables, and segmentation capabilities.',
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Multi-Instance',
    description:
      'Manage multiple WhatsApp numbers from a single dashboard with real-time status.',
  },
  {
    icon: <Webhook size={24} />,
    title: 'Webhooks & API',
    description:
      'Connect to any external system with webhooks and our powerful REST API.',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Analytics',
    description:
      'Track message delivery, flow performance, and contact engagement in real time.',
  },
  {
    icon: <Globe size={24} />,
    title: 'Broadcasts',
    description:
      'Send targeted campaigns to segmented contact lists with personalized messages.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Enterprise Security',
    description:
      'End-to-end encryption, HMAC webhook signatures, and SOC 2 compliant infrastructure.',
  },
]

const pricing = [
  {
    name: 'Starter',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para pequenos negócios',
    features: [
      '1 instância WhatsApp',
      '5 fluxos ativos',
      '1.000 contatos',
      '10.000 mensagens/mês',
      'Webhooks básicos',
      'Suporte por email',
    ],
    cta: 'Começar Grátis',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'R$ 297',
    period: '/mês',
    description: 'Para empresas em crescimento',
    features: [
      '5 instâncias WhatsApp',
      'Fluxos ilimitados',
      '25.000 contatos',
      '100.000 mensagens/mês',
      'Webhooks avançados',
      'API completa',
      'Analytics avançado',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para grandes operações',
    features: [
      'Instâncias ilimitadas',
      'Fluxos ilimitados',
      'Contatos ilimitados',
      'Mensagens ilimitadas',
      'SLA garantido',
      'Onboarding dedicado',
      'Suporte 24/7',
      'White-label disponível',
    ],
    cta: 'Falar com Vendas',
    highlight: false,
  },
]

const testimonials = [
  {
    name: 'Carlos Mendes',
    role: 'CEO, E-commerce Nacional',
    avatar: 'CM',
    text: 'O FlowZap transformou nossa operação de atendimento. Reduzimos 70% do volume de suporte humano com fluxos inteligentes.',
    rating: 5,
  },
  {
    name: 'Ana Paula Silva',
    role: 'Diretora de Marketing, Clínica Bem-Estar',
    avatar: 'AP',
    text: 'Agendamentos automáticos, lembretes de consultas, confirmações — tudo rodando sem intervenção manual. Incrível.',
    rating: 5,
  },
  {
    name: 'Ricardo Oliveira',
    role: 'Fundador, Agência Digital',
    avatar: 'RO',
    text: 'Gerencio 15 clientes diferentes com múltiplas instâncias. O painel centralizado é exatamente o que precisávamos.',
    rating: 5,
  },
]

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center shadow-glow">
              <Zap size={16} className="text-text-inverse" />
            </div>
            <span className="font-heading text-xl font-bold text-gold">FlowZap</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Recursos
            </a>
            <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Preços
            </a>
            <a href="#testimonials" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Depoimentos
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Começar Grátis
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-gold/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gold/5 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/3 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-muted border border-border mb-6">
            <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
            <span className="text-xs text-gold font-medium">Plataforma de Automação WhatsApp #1 do Brasil</span>
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary leading-tight mb-6">
            Automatize seu{' '}
            <span className="text-gold-gradient">WhatsApp</span>
            <br />
            com inteligência
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Crie fluxos de automação poderosos, gerencie contatos, envie campanhas e integre com
            qualquer sistema — tudo em uma plataforma premium.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register">
              <Button size="lg" variant="primary">
                Criar conta grátis
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Ver demonstração
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary">
            {['Sem cartão de crédito', '14 dias grátis', 'Cancele quando quiser'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-success" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero image/preview */}
        <div className="max-w-5xl mx-auto mt-16 relative z-10">
          <div className="bg-background-card border border-border rounded-2xl shadow-modal overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background-elevated">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-text-muted font-body mx-auto">FlowZap — Editor de Fluxos</span>
            </div>
            <div className="p-8 bg-background" style={{ minHeight: 300 }}>
              {/* Mock flow editor preview */}
              <div className="flex items-start gap-4 flex-wrap">
                {/* Trigger node */}
                <div className="bg-background-card border border-gold/30 rounded-xl p-4 w-48 shadow-glow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-gold/20 flex items-center justify-center">
                      <Zap size={12} className="text-gold" />
                    </div>
                    <span className="text-xs font-medium text-gold font-body">Gatilho</span>
                  </div>
                  <p className="text-sm text-text-primary font-body">Palavra-chave: "oi"</p>
                </div>

                {/* Arrow */}
                <div className="flex items-center mt-6">
                  <ChevronRight size={20} className="text-gold/50" />
                </div>

                {/* Message node */}
                <div className="bg-background-card border border-border rounded-xl p-4 w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center">
                      <MessageSquare size={12} className="text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-text-secondary font-body">Mensagem</span>
                  </div>
                  <p className="text-sm text-text-primary font-body">Olá! Como posso ajudar?</p>
                </div>

                <div className="flex items-center mt-6">
                  <ChevronRight size={20} className="text-gold/50" />
                </div>

                {/* Condition node */}
                <div className="bg-background-card border border-border rounded-xl p-4 w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
                      <Bot size={12} className="text-purple-400" />
                    </div>
                    <span className="text-xs font-medium text-text-secondary font-body">Condição</span>
                  </div>
                  <p className="text-sm text-text-primary font-body">tag = "cliente"</p>
                </div>

                <div className="flex items-center mt-6">
                  <ChevronRight size={20} className="text-gold/50" />
                </div>

                {/* Delay node */}
                <div className="bg-background-card border border-border rounded-xl p-4 w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-md bg-orange-500/20 flex items-center justify-center">
                      <Workflow size={12} className="text-orange-400" />
                    </div>
                    <span className="text-xs font-medium text-text-secondary font-body">Aguardar</span>
                  </div>
                  <p className="text-sm text-text-primary font-body">5 segundos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-text-primary mb-4">
              Tudo que você precisa para{' '}
              <span className="text-gold-gradient">automatizar</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Uma plataforma completa com todas as ferramentas para escalar seu atendimento e marketing via WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-background-card border border-border rounded-card p-5 hover:border-gold/30 hover:shadow-glow transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gold-muted border border-border flex items-center justify-center text-gold mb-4 group-hover:bg-gold-gradient group-hover:text-text-inverse group-hover:shadow-glow transition-all">
                  {feature.icon}
                </div>
                <h3 className="font-heading text-base font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-border bg-background-card">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '50M+', label: 'Mensagens enviadas' },
              { value: '12K+', label: 'Empresas ativas' },
              { value: '99.9%', label: 'Uptime garantido' },
              { value: '4.9/5', label: 'Avaliação média' },
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="font-heading text-4xl font-bold text-gold mb-1">{stat.value}</p>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-text-primary mb-4">
              Planos simples e{' '}
              <span className="text-gold-gradient">transparentes</span>
            </h2>
            <p className="text-text-secondary text-lg">Sem taxas ocultas. Cancele quando quiser.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((plan, idx) => (
              <div
                key={idx}
                className={`
                  relative rounded-2xl p-6
                  ${plan.highlight
                    ? 'bg-background-card border-2 border-gold shadow-glow-lg'
                    : 'bg-background-card border border-border'
                  }
                `}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gold-gradient rounded-full text-xs font-bold text-text-inverse whitespace-nowrap">
                    Mais Popular
                  </div>
                )}

                <h3 className="font-heading text-xl font-semibold text-text-primary mb-1">{plan.name}</h3>
                <p className="text-sm text-text-secondary mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`font-heading text-4xl font-bold ${plan.highlight ? 'text-gold' : 'text-text-primary'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-text-secondary text-sm">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle2 size={14} className={plan.highlight ? 'text-gold' : 'text-success'} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/register" className="block">
                  <Button
                    variant={plan.highlight ? 'primary' : 'secondary'}
                    fullWidth
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-background-card border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-text-primary mb-4">
              Empresas que{' '}
              <span className="text-gold-gradient">confiam</span> no FlowZap
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-background border border-border rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-text-inverse">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/8 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="font-heading text-5xl font-bold text-text-primary mb-4">
            Pronto para{' '}
            <span className="text-gold-gradient">começar?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            Junte-se a milhares de empresas que já automatizaram seu WhatsApp com o FlowZap.
          </p>
          <Link to="/register">
            <Button size="lg" variant="primary">
              Criar conta gratuitamente
              <ArrowRight size={18} />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-text-muted">Sem cartão de crédito. 14 dias grátis.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gold-gradient flex items-center justify-center">
              <Zap size={12} className="text-text-inverse" />
            </div>
            <span className="font-heading font-bold text-gold">FlowZap</span>
          </div>
          <p className="text-xs text-text-muted">© 2024 FlowZap. Todos os direitos reservados.</p>
          <div className="flex gap-4 text-xs text-text-muted">
            <a href="#" className="hover:text-text-secondary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Termos</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
