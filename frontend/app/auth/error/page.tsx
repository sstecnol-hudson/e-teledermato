import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Erro de autenticacao</h2>
        <p className="text-[var(--muted-foreground)]">
          Ocorreu um erro durante o processo de autenticacao. 
          Por favor, tente novamente ou entre em contato com o suporte.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="py-3 px-6 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
