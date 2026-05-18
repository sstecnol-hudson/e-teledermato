"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Stethoscope, Loader2, CheckCircle } from "lucide-react";
import type { UserRole } from "@/lib/types/database";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("solicitante");
  const [crm, setCrm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas nao coincidem");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    if ((role === "dermatologista") && !crm) {
      setError("CRM e obrigatorio para dermatologistas");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role: role,
            crm: crm || null,
          },
        },
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Conta criada com sucesso!</h2>
          <p className="text-[var(--muted-foreground)]">
            Enviamos um email de confirmacao para <strong>{email}</strong>. 
            Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
          </p>
          <Link
            href="/auth/login"
            className="inline-block py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-3 justify-center">
          <div className="p-2 bg-cyan-600 rounded-xl">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-[var(--foreground)]">E-Teledermato</span>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Criar nova conta</h2>
          <p className="text-[var(--muted-foreground)] mt-2">Preencha os dados para se cadastrar</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-[var(--foreground)]">
              Nome completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="Dr. Joao Silva"
              required
            />
          </div>

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
            <label htmlFor="role" className="block text-sm font-medium text-[var(--foreground)]">
              Tipo de usuario
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            >
              <option value="solicitante">Solicitante (Medico/Enfermeiro)</option>
              <option value="dermatologista">Dermatologista</option>
              <option value="gestor">Gestor</option>
            </select>
          </div>

          {role === "dermatologista" && (
            <div className="space-y-2">
              <label htmlFor="crm" className="block text-sm font-medium text-[var(--foreground)]">
                CRM
              </label>
              <input
                id="crm"
                type="text"
                value={crm}
                onChange={(e) => setCrm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                placeholder="CRM/SP 123456"
                required
              />
            </div>
          )}

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
                placeholder="Minimo 6 caracteres"
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

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--foreground)]">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="Repita a senha"
              required
            />
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
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-[var(--muted-foreground)] text-sm">
            Ja tem uma conta?{" "}
            <Link href="/auth/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Faca login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
