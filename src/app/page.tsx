'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Calendar,
  LogIn,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-indigo-600 font-medium">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white shadow-sm mb-6">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Organização Inteligente</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Foque no que importa com <span className="gradient-text">FocusFlow</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Uma plataforma completa de gerenciamento de tempo que combina técnicas de
              produtividade com inteligência artificial para maximizar sua eficiência.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-200"
              >
                <LogIn className="h-5 w-5" />
                Entrar com Google
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl font-semibold text-lg border border-white shadow-sm hover:bg-white transition-all">
                <Zap className="h-5 w-5 text-amber-500" />
                Ver Demonstração
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="glass rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Agendamento Inteligente</h3>
              <p className="text-gray-600 text-sm">
                Sincronize automaticamente suas tarefas com o Google Calendar e nunca mais esqueça
                um compromisso importante.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pomodoro Timer</h3>
              <p className="text-gray-600 text-sm">
                Técnica Pomodoro integrada para manter o foco e aumentar sua produtividade em até
                40%.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Metas e Progresso</h3>
              <p className="text-gray-600 text-sm">
                Acompanhe seu progresso diário, semanal e mensal com análises detalhadas do seu
                desempenho.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recursos Poderosos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar seu tempo de forma eficiente e alcançar seus
              objetivos.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full mb-4">
                <Zap className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">IA Integrada</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Extração Inteligente de Tarefas
              </h3>
              <p className="text-gray-600 mb-6">
                Transforme linguagem natural em tarefas estruturadas. Digite &#34;Reunião com
                cliente amanhã às 14h, prioridade alta&#34; e nossa IA extrai automaticamente data,
                hora, duração e prioridade.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-gray-700">
                    Reconhecimento automático de datas e horários
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-gray-700">Estimativa inteligente de duração</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="text-gray-700">Classificação automática de prioridade</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="font-medium">&#34;Reunião com equipe de marketing&#34;</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Hoje, 14:00</span>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">1h</span>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Média</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="font-medium">&#34;Finalizar relatório trimestral&#34;</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Até sexta</span>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">3h</span>
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">Alta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white shadow-sm mb-6">
            <Shield className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">14 dias grátis</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Pronto para transformar sua produtividade?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de usuários que já estão gerenciando seu tempo de forma mais
            eficiente com o FocusFlow.
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            <LogIn className="h-5 w-5" />
            Começar Agora - É Grátis
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
