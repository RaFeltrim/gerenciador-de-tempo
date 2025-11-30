'use client';

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Calendar, LogIn, CheckCircle, Clock, Target, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";

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
          <div className="absolute top-60 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Potencialize sua produtividade</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Gerencie seu tempo com{' '}
                <span className="gradient-text">inteligência</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                FocusFlow combina o poder da IA com integração direta ao Google Calendar e Google Tasks para transformar a forma como você organiza seu dia.
              </p>

              {/* CTA Button */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    await signIn("google", { callbackUrl: '/dashboard' });
                  } catch (error) {
                    console.error("Sign in exception:", error);
                  }
                }}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-200"
              >
                <LogIn className="h-5 w-5" />
                Começar com Google
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="mt-4 text-sm text-gray-500">
                Sincroniza automaticamente com seu Google Calendar e Tasks
              </p>
            </div>

            {/* Right - Card */}
            <div className="flex-1 w-full max-w-md">
              <div className="glass rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 card-hover">
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-30 float-animation"></div>
                    <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl">
                      <Calendar className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">FocusFlow</h2>
                <p className="text-gray-600 text-center mb-8">Seu assistente de produtividade pessoal</p>

                {/* Features list */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-xl">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Linguagem Natural</p>
                      <p className="text-sm text-gray-500">Crie tarefas como você fala</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-indigo-50 to-transparent rounded-xl">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Timer Pomodoro</p>
                      <p className="text-sm text-gray-500">Mantenha o foco com técnicas comprovadas</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-xl">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sincronização Google</p>
                      <p className="text-sm text-gray-500">Calendar e Tasks em tempo real</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Por que escolher o FocusFlow?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Uma experiência diferenciada que vai além do básico
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass rounded-2xl p-6 card-hover">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Produtividade Maximizada</h3>
            <p className="text-gray-600">
              IA que entende suas tarefas e organiza automaticamente seu calendário para máxima eficiência.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Integração Total</h3>
            <p className="text-gray-600">
              Conecte seu Google Calendar e Tasks para uma visão unificada de todas suas atividades.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 card-hover">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Seguro e Privado</h3>
            <p className="text-gray-600">
              Seus dados protegidos com autenticação Google OAuth. Nós respeitamos sua privacidade.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold text-gray-900">FocusFlow</span>
            </div>
            <p className="text-sm text-gray-500">
              Feito com ❤️ para aumentar sua produtividade
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}