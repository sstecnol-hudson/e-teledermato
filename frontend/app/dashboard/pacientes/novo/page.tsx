"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function NewPatientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    cpf: "",
    cns: "",
    birth_date: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "SP",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCPFInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 11);
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPFInput(e.target.value);
    setFormData((prev) => ({ ...prev, cpf: formatted }));
  };

  const formatPhoneInput = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 11);
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await (supabase as any).from("patients").insert({
        full_name: formData.full_name,
        cpf: formData.cpf.replace(/\D/g, "") || null,
        cns: formData.cns || null,
        birth_date: formData.birth_date,
        gender: formData.gender || null,
        phone: formData.phone.replace(/\D/g, "") || null,
        email: formData.email || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success("Paciente cadastrado com sucesso!");
      router.push("/dashboard/pacientes");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao cadastrar paciente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/pacientes"
          className="p-2 hover:bg-[var(--secondary)] rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Novo Paciente</h1>
          <p className="text-[var(--muted-foreground)]">Cadastre um novo paciente no sistema</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Dados Pessoais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="full_name" className="block text-sm font-medium text-[var(--foreground)]">
                Nome completo *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cpf" className="block text-sm font-medium text-[var(--foreground)]">
                CPF
              </label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cns" className="block text-sm font-medium text-[var(--foreground)]">
                Cartao SUS (CNS)
              </label>
              <input
                id="cns"
                name="cns"
                type="text"
                value={formData.cns}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="birth_date" className="block text-sm font-medium text-[var(--foreground)]">
                Data de nascimento *
              </label>
              <input
                id="birth_date"
                name="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm font-medium text-[var(--foreground)]">
                Sexo
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Contato</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-[var(--foreground)]">
                Telefone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Endereco</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-[var(--foreground)]">
                Endereco
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua, numero, bairro"
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="city" className="block text-sm font-medium text-[var(--foreground)]">
                Cidade
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="block text-sm font-medium text-[var(--foreground)]">
                Estado
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="SP">Sao Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="PR">Parana</option>
                <option value="SC">Santa Catarina</option>
                <option value="BA">Bahia</option>
                <option value="PE">Pernambuco</option>
                <option value="CE">Ceara</option>
                <option value="GO">Goias</option>
                <option value="DF">Distrito Federal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border)]">
          <Link
            href="/dashboard/pacientes"
            className="px-6 py-3 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)] transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Salvar Paciente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
