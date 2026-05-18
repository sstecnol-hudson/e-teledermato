// Sistema de Teledermatologia - E-Teledermato
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Stethoscope, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-600 to-cyan-800">
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">E-Teledermato</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-white hover:text-cyan-100 font-medium transition"
          >
            Entrar
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 bg-white text-cyan-700 font-medium rounded-lg hover:bg-cyan-50 transition"
          >
            Cadastrar
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Teledermatologia com Inteligencia Artificial
          </h1>
          <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
            Sistema de triagem inteligente para casos dermatologicos. 
            Conecte solicitantes a dermatologistas, com analise assistida por IA 
            para priorizacao de casos urgentes.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-cyan-700 font-medium rounded-lg hover:bg-cyan-50 transition"
            >
              Comecar agora
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition border border-white/20"
            >
              Ja tenho conta
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-white mb-2">Protocolo A</div>
            <h3 className="text-lg font-semibold text-white mb-2">Cancer de Pele</h3>
            <p className="text-cyan-100">
              Triagem especializada para lesoes suspeitas de cancer de pele com priorizacao automatica.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-white mb-2">Protocolo B</div>
            <h3 className="text-lg font-semibold text-white mb-2">Dermatoses Gerais</h3>
            <p className="text-cyan-100">
              Avaliacao de dermatoses diversas com classificacao por nivel de risco.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-white mb-2">IA</div>
            <h3 className="text-lg font-semibold text-white mb-2">Analise Inteligente</h3>
            <p className="text-cyan-100">
              Inteligencia artificial para pre-analise de imagens e sugestao de priorizacao.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
