import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, MapPin, Phone, Mail, FileText } from "lucide-react";
import { formatDate, formatCPF, formatPhone, calculateAge, getStatusText, getStatusColor } from "@/lib/utils";

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient, error } = await (supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single() as any);

  if (error || !patient) {
    notFound();
  }

  // Get patient's cases
  const { data: cases } = await (supabase
    .from("cases")
    .select("*")
    .eq("patient_id", id)
    .order("created_at", { ascending: false }) as any);

  const genderLabels: Record<string, string> = {
    M: "Masculino",
    F: "Feminino",
    O: "Outro",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/pacientes"
          className="p-2 hover:bg-[var(--secondary)] rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{patient.full_name}</h1>
          <p className="text-[var(--muted-foreground)]">Detalhes do paciente</p>
        </div>
        <Link
          href={`/dashboard/casos/novo?patient_id=${patient.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
        >
          <FileText className="h-5 w-5" />
          Novo Caso
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Dados Pessoais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">CPF</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {patient.cpf ? formatCPF(patient.cpf) : "Nao informado"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">CNS</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {patient.cns || "Nao informado"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Data de Nascimento</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {formatDate(patient.birth_date)} ({calculateAge(patient.birth_date)} anos)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Sexo</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {patient.gender ? genderLabels[patient.gender] : "Nao informado"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Contato</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Telefone</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {patient.phone ? formatPhone(patient.phone) : "Nao informado"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Email</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {patient.email || "Nao informado"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="h-5 w-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-sm text-[var(--muted-foreground)]">Endereco</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {patient.address 
                      ? `${patient.address}, ${patient.city || ""} - ${patient.state}`
                      : "Nao informado"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cases Summary */}
        <div className="space-y-6">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Casos</h2>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-cyan-600">{cases?.length || 0}</p>
              <p className="text-sm text-[var(--muted-foreground)]">casos registrados</p>
            </div>
          </div>

          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Cadastro</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Criado em</p>
            <p className="font-medium text-[var(--foreground)]">{formatDate(patient.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Cases List */}
      {cases && cases.length > 0 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Historico de Casos</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {cases.map((caso: any) => (
              <Link
                key={caso.id}
                href={`/dashboard/casos/${caso.id}`}
                className="flex items-center justify-between p-4 hover:bg-[var(--secondary)] transition"
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">{caso.protocol_number}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{caso.chief_complaint}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(caso.status)}`}>
                    {getStatusText(caso.status)}
                  </span>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">{formatDate(caso.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
