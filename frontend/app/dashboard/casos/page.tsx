import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search, FileText, Filter } from "lucide-react";
import { formatDateTime, getRiskLevelColor, getRiskLevelText, getStatusText, getStatusColor } from "@/lib/utils";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const { search, status } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await (supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id || "")
    .single() as any);

  let query = (supabase as any)
    .from("cases")
    .select(`
      *,
      patient:patients(full_name),
      requester:profiles!cases_requester_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false });

  // Filter by role
  if (profile?.role === "solicitante") {
    query = query.eq("requester_id", user?.id || "");
  }

  // Filter by search
  if (search) {
    query = query.or(`protocol_number.ilike.%${search}%`);
  }

  // Filter by status
  if (status) {
    query = query.eq("status", status);
  }

  const { data: cases } = await query;

  const statusOptions = [
    { value: "", label: "Todos" },
    { value: "aguardando_triagem", label: "Aguardando Triagem" },
    { value: "em_analise", label: "Em Analise" },
    { value: "laudado", label: "Laudado" },
    { value: "encaminhado", label: "Encaminhado" },
    { value: "resolvido", label: "Resolvido" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {profile?.role === "solicitante" ? "Meus Casos" : "Fila de Casos"}
          </h1>
          <p className="text-[var(--muted-foreground)]">
            {profile?.role === "dermatologista" 
              ? "Casos aguardando analise" 
              : "Acompanhe suas solicitacoes"}
          </p>
        </div>
        {(profile?.role === "solicitante" || profile?.role === "admin") && (
          <Link
            href="/dashboard/casos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            <Plus className="h-5 w-5" />
            Novo Caso
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar por protocolo..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-[var(--muted-foreground)]" />
          <div className="flex gap-2 flex-wrap">
            {statusOptions.map((option) => (
              <Link
                key={option.value}
                href={`/dashboard/casos${option.value ? `?status=${option.value}` : ""}`}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  status === option.value || (!status && !option.value)
                    ? "bg-cyan-600 text-white"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-cyan-100 hover:text-cyan-700"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        {cases && cases.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {cases.map((caso: any) => (
              <Link
                key={caso.id}
                href={`/dashboard/casos/${caso.id}`}
                className="flex items-center gap-4 p-4 hover:bg-[var(--secondary)] transition"
              >
                {/* Risk indicator */}
                <div className="flex-shrink-0">
                  {caso.risk_level ? (
                    <div
                      className={`w-4 h-4 rounded-full ${getRiskLevelColor(caso.risk_level)}`}
                      title={getRiskLevelText(caso.risk_level)}
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-300" title="Sem classificacao" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[var(--foreground)]">
                      {caso.protocol_number}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(caso.status)}`}>
                      {getStatusText(caso.status)}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700">
                      Protocolo {caso.protocol_type}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] truncate mt-1">
                    <span className="font-medium">{caso.patient?.full_name}</span> - {caso.chief_complaint}
                  </p>
                </div>

                <div className="text-right hidden sm:block flex-shrink-0">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {formatDateTime(caso.created_at)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    por {caso.requester?.full_name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)] mb-4">
              {search || status ? "Nenhum caso encontrado com esses filtros" : "Nenhum caso cadastrado"}
            </p>
            {(profile?.role === "solicitante" || profile?.role === "admin") && !search && !status && (
              <Link
                href="/dashboard/casos/novo"
                className="inline-block px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                Criar primeiro caso
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
