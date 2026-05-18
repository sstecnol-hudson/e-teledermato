import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search, User } from "lucide-react";
import { formatDate, formatCPF, calculateAge } from "@/lib/utils";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const supabase = await createClient();

  let query = (supabase as any)
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,cpf.ilike.%${search}%`);
  }

  const { data: patients } = await query;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Pacientes</h1>
          <p className="text-[var(--muted-foreground)]">Gerencie os pacientes cadastrados</p>
        </div>
        <Link
          href="/dashboard/pacientes/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
        >
          <Plus className="h-5 w-5" />
          Novo Paciente
        </Link>
      </div>

      {/* Search */}
      <form className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Buscar por nome ou CPF..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </form>

      {/* Patients List */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        {patients && patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--secondary)]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[var(--muted-foreground)]">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[var(--muted-foreground)] hidden sm:table-cell">
                    CPF
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[var(--muted-foreground)] hidden md:table-cell">
                    Idade
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[var(--muted-foreground)] hidden lg:table-cell">
                    Cidade
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[var(--muted-foreground)] hidden lg:table-cell">
                    Cadastro
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {patients.map((patient: any) => (
                  <tr key={patient.id} className="hover:bg-[var(--secondary)] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 rounded-full">
                          <User className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{patient.full_name}</p>
                          <p className="text-sm text-[var(--muted-foreground)] sm:hidden">
                            {patient.cpf ? formatCPF(patient.cpf) : "Sem CPF"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--foreground)] hidden sm:table-cell">
                      {patient.cpf ? formatCPF(patient.cpf) : "-"}
                    </td>
                    <td className="px-6 py-4 text-[var(--foreground)] hidden md:table-cell">
                      {calculateAge(patient.birth_date)} anos
                    </td>
                    <td className="px-6 py-4 text-[var(--foreground)] hidden lg:table-cell">
                      {patient.city || "-"}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted-foreground)] hidden lg:table-cell">
                      {formatDate(patient.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/pacientes/${patient.id}`}
                        className="text-cyan-600 hover:text-cyan-700 font-medium text-sm"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)] mb-4">
              {search ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
            </p>
            <Link
              href="/dashboard/pacientes/novo"
              className="inline-block px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
            >
              Cadastrar paciente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
