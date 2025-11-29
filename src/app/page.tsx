'use client';

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Calendar, LogIn, CheckCircle, Clock, Target } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-indigo-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">FocusFlow</h1>
          <p className="mt-2 text-gray-600">
            Seu Gerenciador de Tarefas Pessoal
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-3 text-gray-700">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Gerencie suas tarefas com linguagem natural</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="h-5 w-5 text-indigo-500" />
            <span className="text-sm">Timer Pomodoro para manter o foco</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Target className="h-5 w-5 text-orange-500" />
            <span className="text-sm">Priorize e acompanhe seu progresso</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span className="text-sm">Integração com Google Calendar</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Entre com sua conta Google para começar
          </p>
          <button
            onClick={async (e) => {
              e.preventDefault();
              try {
                await signIn("google", { callbackUrl: '/dashboard' });
              } catch (error) {
                console.error("Sign in exception:", error);
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <LogIn className="h-5 w-5" />
            Entrar com Google
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>O FocusFlow acessará seu Google Calendar para gerenciar tarefas</p>
        </div>
      </div>
    </div>
  );
}