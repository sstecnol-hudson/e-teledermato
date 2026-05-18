import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText,
  AlertCircle,
  CheckCircle,
  Stethoscope
} from "lucide-react";
import { 
  formatDate, 
  formatDateTime, 
  formatCPF, 
  calculateAge, 
  getRiskLevelColor, 
  getRiskLevelText, 
  getStatusText, 
  getStatusColor 
} from "@/lib/utils";
import { AnalyzeButton } from "@/components/analyze-button";
import { CreateReportButton } from "@/components/create-report-button";

export default async function CaseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await (supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id || "")
    .single() as any);

  const { data: caso, error } = await (supabase
    .from("cases")
    .select(`
      *,
      patient:patients(*),
      requester:profiles!cases_requester_id_fkey(*),
      assigned_dermatologist:profiles!cases_assigned_to_fkey(*)
    `)
    .eq("id", id)
    .single() as any);

  if (error || !caso) {
    notFound();
  }

  const { data: images } = await (supabase
    .from("case_images")
    .select("*")
    .eq("case_id", id)
    .order("uploaded_at", { ascending: true }) as any);

  const { data: reports } = await (supabase
    .from("reports")
    .select(`
      *,
      dermatologist:profiles(full_name, crm)
    `)
    .eq("case_id", id)
    .order("created_at", { ascending: false }) as any);

  const canAnalyze = profile?.role === "dermatologista" || profile?.role === "admin";
  const canCreateReport = canAnalyze && caso.status !== "laudado";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/casos"
          className="p-2 hover:bg-[var(--secondary)] rounded-lg transition mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{caso.protocol_number}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(caso.status)}`}>
              {getStatusText(caso.status)}
            </span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-cyan-100 text-cyan-700">
              Protocolo {caso.protocol_type}
            </span>
            {caso.risk_level && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full text-white ${getRiskLevelColor(caso.risk_level)}`}>
                {getRiskLevelText(caso.risk_level)}
              </span>
            )}
          </div>
          <p className="text-[var(--muted-foreground)] mt-1">
            Criado em {formatDateTime(caso.created_at)} por {caso.requester?.full_name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-600" />
              Paciente
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Nome</p>
                <p className="font-medium text-[var(--foreground)]">{caso.patient?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">CPF</p>
                <p className="font-medium text-[var(--foreground)]">
                  {caso.patient?.cpf ? formatCPF(caso.patient.cpf) : "Nao informado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Idade</p>
                <p className="font-medium text-[var(--foreground)]">
                  {calculateAge(caso.patient?.birth_date)} anos
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Data de Nascimento</p>
                <p className="font-medium text-[var(--foreground)]">
                  {formatDate(caso.patient?.birth_date)}
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/pacientes/${caso.patient?.id}`}
              className="inline-block mt-4 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              Ver perfil completo
            </Link>
          </div>

          {/* Clinical Data */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600" />
              Dados Clinicos
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Queixa Principal</p>
                <p className="text-[var(--foreground)]">{caso.chief_complaint}</p>
              </div>
              
              {caso.clinical_history && (
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Historia Clinica</p>
                  <p className="text-[var(--foreground)]">{caso.clinical_history}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {caso.lesion_location && (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Localizacao da Lesao</p>
                    <p className="font-medium text-[var(--foreground)]">{caso.lesion_location}</p>
                  </div>
                )}
                {caso.lesion_duration && (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Tempo de Evolucao</p>
                    <p className="font-medium text-[var(--foreground)]">{caso.lesion_duration}</p>
                  </div>
                )}
              </div>

              {caso.previous_treatments && (
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Tratamentos Anteriores</p>
                  <p className="text-[var(--foreground)]">{caso.previous_treatments}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {caso.comorbidities && (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Comorbidades</p>
                    <p className="text-[var(--foreground)]">{caso.comorbidities}</p>
                  </div>
                )}
                {caso.medications && (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Medicacoes em Uso</p>
                    <p className="text-[var(--foreground)]">{caso.medications}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Imagens ({images?.length || 0})
            </h2>
            {images && images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((image: any, index: number) => (
                  <a
                    key={image.id}
                    href={image.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <Image
                      src={image.image_url}
                      alt={`Imagem ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[var(--muted-foreground)]">Nenhuma imagem anexada</p>
            )}
          </div>

          {/* AI Analysis */}
          {caso.ai_analysis && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-purple-600" />
                Analise de IA
              </h2>
              <div className="prose prose-sm max-w-none text-purple-900">
                <p className="whitespace-pre-wrap">{caso.ai_analysis}</p>
              </div>
              {caso.ai_risk_assessment && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-sm font-medium text-purple-700">Avaliacao de Risco:</p>
                  <p className="text-purple-900">{caso.ai_risk_assessment}</p>
                </div>
              )}
            </div>
          )}

          {/* Reports */}
          {reports && reports.length > 0 && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Laudo
              </h2>
              {reports.map((report: any) => (
                <div key={report.id} className="space-y-4">
                  <div>
                    <p className="text-sm text-green-700">Hipotese Diagnostica</p>
                    <p className="font-medium text-green-900">{report.hypothesis}</p>
                  </div>
                  {report.cid10_code && (
                    <div>
                      <p className="text-sm text-green-700">CID-10</p>
                      <p className="text-green-900">{report.cid10_code} - {report.cid10_description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-green-700">Conduta</p>
                    <p className="text-green-900">{report.conduct}</p>
                  </div>
                  {report.recommendations && (
                    <div>
                      <p className="text-sm text-green-700">Recomendacoes</p>
                      <p className="text-green-900">{report.recommendations}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-green-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Dermatologista</p>
                      <p className="font-medium text-green-900">
                        {report.dermatologist?.full_name} - {report.dermatologist?.crm}
                      </p>
                    </div>
                    <p className="text-sm text-green-700">{formatDateTime(report.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {canAnalyze && (
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-4">
              <h3 className="font-semibold text-[var(--foreground)]">Acoes</h3>
              
              {!caso.ai_analysis && (
                <AnalyzeButton caseId={caso.id} />
              )}
              
              {canCreateReport && (
                <CreateReportButton caseId={caso.id} />
              )}
            </div>
          )}

          {/* Case Info */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Informacoes</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Criado em</p>
                  <p className="text-sm text-[var(--foreground)]">{formatDateTime(caso.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Solicitante</p>
                  <p className="text-sm text-[var(--foreground)]">{caso.requester?.full_name}</p>
                </div>
              </div>
              {caso.assigned_dermatologist && (
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Dermatologista</p>
                    <p className="text-sm text-[var(--foreground)]">{caso.assigned_dermatologist?.full_name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Ultima atualizacao</p>
                  <p className="text-sm text-[var(--foreground)]">{formatDateTime(caso.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Legend */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Niveis de Risco</h3>
            <div className="space-y-2">
              {[
                { level: "verde", label: "Verde - Baixo Risco" },
                { level: "amarelo_leve", label: "Amarelo Leve" },
                { level: "amarelo_grave", label: "Amarelo Grave" },
                { level: "vermelho", label: "Vermelho - Alto" },
                { level: "urgencia", label: "Urgencia" },
              ].map((item) => (
                <div key={item.level} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getRiskLevelColor(item.level)}`} />
                  <span className="text-sm text-[var(--muted-foreground)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
