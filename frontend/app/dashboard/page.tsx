import { createClient } from "@/lib/supabase/server";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Activity
} from "lucide-react";
import Link from "next/link";
import { formatDateTime, getRiskLevelColor, getRiskLevelText, getStatusText, getStatusColor } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await (supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id || "")
    .single() as any);

  // Get statistics
  const { count: totalCases } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true });

  const { count: pendingCases } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "aguardando_triagem");

  const { count: inAnalysisCases } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "em_analise");

  const { count: completedCases } = await supabase
    .from("cases")
    .select("*", { count: "exact", head: true })
    .eq("status", "laudado");

  const { count: totalPatients } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true });

  // Get recent cases for queue
  let casesQuery = (supabase as any)
    .from("cases")
    .select(`
      *,
      patient:patients(full_name, birth_date),
      requester:profiles!cases_requester_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  // Filter by role
  if (profile?.role === "solicitante") {
    casesQuery = casesQuery.eq("requester_id", user?.id || "");
  } else if (profile?.role === "dermatologista") {
    casesQuery = casesQuery.or(`assigned_to.eq.${user?.id || ""},status.eq.aguardando_triagem`);
  }

  const { data: recentCases } = await casesQuery;

  const stats = [
    {
      name: "Total de Casos",
      value: totalCases || 0,
      icon: FileText,
      color: "bg-blue-500",
      href: "/dashboard/casos",
    },
    {
      name: "Aguardando Triagem",
      value: pendingCases || 0,
      icon: Clock,
      color: "bg-yellow-500",
      href: "/dashboard/casos?status=aguardando_triagem",
    },
    {
      name: "Em Analise",
      value: inAnalysisCases || 0,
      icon: Activity,
      color: "bg-cyan-500",
      href: "/dashboard/casos?status=em_analise",
    },
    {
      name: "Laudados",
      value: completedCases || 0,
      icon: CheckCircle,
      color: "bg-green-500",
      href: "/dashboard/casos?status=laudado",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Ola, {profile?.full_name?.split(" ")[0]}!
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Bem-vindo ao sistema de teledermatologia
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] hover:shadow-lg transition group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">{stat.name}</p>
                <p className="text-2xl font-bold text-[var(--foreground)] group-hover:text-cyan-600 transition">
                  {stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      {profile?.role === "solicitante" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/pacientes/novo"
            className="flex items-center gap-4 p-6 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-cyan-500 transition group"
          >
            <div className="p-3 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition">
              <Users className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)]">Cadastrar Paciente</p>
              <p className="text-sm text-[var(--muted-foreground)]">Adicione um novo paciente ao sistema</p>
            </div>
          </Link>
          <Link
            href="/dashboard/casos/novo"
            className="flex items-center gap-4 p-6 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-cyan-500 transition group"
          >
            <div className="p-3 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition">
              <FileText className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)]">Novo Caso</p>
              <p className="text-sm text-[var(--muted-foreground)]">Crie uma nova solicitacao de teleconsulta</p>
            </div>
          </Link>
        </div>
      )}

      {/* Cases Queue */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Fila de Casos</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {profile?.role === "dermatologista" 
                ? "Casos aguardando sua analise" 
                : "Seus casos recentes"}
            </p>
          </div>
          <Link
            href="/dashboard/casos"
            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Ver todos
          </Link>
        </div>

        {recentCases && recentCases.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
             {recentCases.map((caso: any) => (
              <Link
                key={caso.id}
                href={`/dashboard/casos/${caso.id}`}
                className="flex items-center gap-4 p-4 hover:bg-[var(--secondary)] transition"
              >
                {/* Risk indicator */}
                {caso.risk_level && (
                  <div
                    className={`w-3 h-3 rounded-full ${getRiskLevelColor(caso.risk_level)}`}
                    title={getRiskLevelText(caso.risk_level)}
                  />
                )}
                {!caso.risk_level && (
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
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
                  <p className="text-sm text-[var(--muted-foreground)] truncate">
                    {caso.patient?.full_name} - {caso.chief_complaint}
                  </p>
                </div>

                <div className="text-right hidden sm:block">
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
            <p className="text-[var(--muted-foreground)]">Nenhum caso encontrado</p>
            {profile?.role === "solicitante" && (
              <Link
                href="/dashboard/casos/novo"
                className="inline-block mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
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
