"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Stethoscope, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-600 to-cyan-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">E-Teledermato</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Sistema de Teledermatologia com Inteligencia Artificial
          </h1>
          <p className="text-cyan-100 text-lg">
            Triagem inteligente de casos dermatologicos para profissionais de saude.
            Agilize o atendimento e melhore o acesso a especialistas.
          </p>
        </div>

        <div className="flex gap-8 text-cyan-100">
          <div>
            <div className="text-3xl font-bold text-white">+5000</div>
            <div className="text-sm">Casos analisados</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">98%</div>
            <div className="text-sm">Precisao da IA</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">24h</div>
            <div className="text-sm">Tempo medio de laudo</div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--background)]">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="p-2 bg-cyan-600 rounded-xl">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--foreground)]">E-Teledermato</span>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Bem-vindo de volta</h2>
            <p className="text-[var(--muted-foreground)] mt-2">Entre com suas credenciais para acessar o sistema</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition pr-12"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-[var(--muted-foreground)] text-sm">
              Nao tem uma conta?{" "}
              <Link href="/auth/signup" className="text-cyan-600 hover:text-cyan-700 font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
