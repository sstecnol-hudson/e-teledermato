"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, Search, User } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/image-uploader";
import type { Patient, ProtocolType } from "@/lib/types/database";
import { formatCPF, calculateAge } from "@/lib/utils";

export default function NewCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patient_id");
  
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(preselectedPatientId ? 2 : 1);
  const [caseId, setCaseId] = useState<string | null>(null);
  
  // Patient selection
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Case data
  const [formData, setFormData] = useState({
    protocol_type: "B" as ProtocolType,
    chief_complaint: "",
    clinical_history: "",
    lesion_location: "",
    lesion_duration: "",
    previous_treatments: "",
    comorbidities: "",
    medications: "",
  });

  // Images
  const [images, setImages] = useState<{ id: string; url: string }[]>([]);

  // Load preselected patient
  useEffect(() => {
    if (preselectedPatientId) {
      loadPatient(preselectedPatientId);
    }
  }, [preselectedPatientId]);

  const loadPatient = async (patientId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .single();
    
    if (data) {
      setSelectedPatient(data);
      setStep(2);
    }
  };

  const searchPatients = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const supabase = createClient();
    
    const { data } = await supabase
      .from("patients")
      .select("*")
      .or(`full_name.ilike.%${searchQuery}%,cpf.ilike.%${searchQuery.replace(/\D/g, "")}%`)
      .limit(10);
    
    setPatients(data || []);
    setIsSearching(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createCase = async () => {
    if (!selectedPatient) return;
    
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create case first to get the ID for image upload
      const { data: newCase, error } = await (supabase as any)
        .from("cases")
        .insert({
          protocol_type: formData.protocol_type,
          patient_id: selectedPatient.id,
          requester_id: user?.id,
          chief_complaint: formData.chief_complaint,
          clinical_history: formData.clinical_history || null,
          lesion_location: formData.lesion_location || null,
          lesion_duration: formData.lesion_duration || null,
          previous_treatments: formData.previous_treatments || null,
          comorbidities: formData.comorbidities || null,
          medications: formData.medications || null,
          status: "aguardando_triagem",
        })
        .select()
        .single();

      if (error) throw error;

      setCaseId(newCase.id);
      setStep(3);
      toast.success("Caso criado! Agora adicione as imagens.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar caso");
    } finally {
      setIsLoading(false);
    }
  };

  const submitCase = async () => {
    if (images.length === 0) {
      toast.error("Adicione pelo menos uma imagem da lesao");
      return;
    }

    toast.success("Caso enviado para triagem com sucesso!");
    router.push("/dashboard/casos");
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-[var(--secondary)] rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Novo Caso</h1>
          <p className="text-[var(--muted-foreground)]">Crie uma solicitacao de teleconsulta dermatologica</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s <= step
                  ? "bg-cyan-600 text-white"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-1 rounded ${s < step ? "bg-cyan-600" : "bg-[var(--secondary)]"}`} />
            )}
          </div>
        ))}
        <div className="ml-4 text-sm text-[var(--muted-foreground)]">
          {step === 1 && "Selecionar Paciente"}
          {step === 2 && "Dados Clinicos"}
          {step === 3 && "Imagens"}
        </div>
      </div>

      {/* Step 1: Patient Selection */}
      {step === 1 && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Selecionar Paciente</h2>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPatients()}
                placeholder="Buscar por nome ou CPF..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button
              onClick={searchPatients}
              disabled={isSearching}
              className="px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Buscar"}
            </button>
          </div>

          {patients.length > 0 && (
            <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setStep(2);
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[var(--secondary)] transition text-left"
                >
                  <div className="p-2 bg-cyan-100 rounded-full">
                    <User className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--foreground)]">{patient.full_name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {patient.cpf ? formatCPF(patient.cpf) : "Sem CPF"} - {calculateAge(patient.birth_date)} anos
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-4 border-t border-[var(--border)]">
            <span className="text-[var(--muted-foreground)]">Paciente nao encontrado?</span>
            <Link href="/dashboard/pacientes/novo" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Cadastrar novo paciente
            </Link>
          </div>
        </div>
      )}

      {/* Step 2: Clinical Data */}
      {step === 2 && selectedPatient && (
        <div className="space-y-6">
          {/* Selected Patient */}
          <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-full">
                <User className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium text-cyan-900">{selectedPatient.full_name}</p>
                <p className="text-sm text-cyan-700">
                  {selectedPatient.cpf ? formatCPF(selectedPatient.cpf) : "Sem CPF"} - {calculateAge(selectedPatient.birth_date)} anos
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPatient(null);
                setStep(1);
              }}
              className="text-sm text-cyan-600 hover:text-cyan-700"
            >
              Alterar
            </button>
          </div>

          {/* Form */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="protocol_type" className="block text-sm font-medium text-[var(--foreground)]">
                  Tipo de Protocolo *
                </label>
                <select
                  id="protocol_type"
                  name="protocol_type"
                  value={formData.protocol_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="A">Protocolo A - Suspeita de Cancer de Pele</option>
                  <option value="B">Protocolo B - Outras Dermatoses</option>
                </select>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {formData.protocol_type === "A" 
                    ? "Para lesoes suspeitas de neoplasia cutanea (melanoma, carcinoma, etc.)"
                    : "Para dermatoses gerais (eczemas, micoses, psoriase, etc.)"}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="chief_complaint" className="block text-sm font-medium text-[var(--foreground)]">
                  Queixa Principal *
                </label>
                <textarea
                  id="chief_complaint"
                  name="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descreva a queixa principal do paciente..."
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="lesion_location" className="block text-sm font-medium text-[var(--foreground)]">
                    Localizacao da Lesao
                  </label>
                  <input
                    id="lesion_location"
                    name="lesion_location"
                    type="text"
                    value={formData.lesion_location}
                    onChange={handleChange}
                    placeholder="Ex: Antebraco direito"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="lesion_duration" className="block text-sm font-medium text-[var(--foreground)]">
                    Tempo de Evolucao
                  </label>
                  <input
                    id="lesion_duration"
                    name="lesion_duration"
                    type="text"
                    value={formData.lesion_duration}
                    onChange={handleChange}
                    placeholder="Ex: 3 meses"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="clinical_history" className="block text-sm font-medium text-[var(--foreground)]">
                  Historia Clinica
                </label>
                <textarea
                  id="clinical_history"
                  name="clinical_history"
                  value={formData.clinical_history}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Descreva a historia clinica relevante..."
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="previous_treatments" className="block text-sm font-medium text-[var(--foreground)]">
                  Tratamentos Anteriores
                </label>
                <textarea
                  id="previous_treatments"
                  name="previous_treatments"
                  value={formData.previous_treatments}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Tratamentos ja realizados para esta queixa..."
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="comorbidities" className="block text-sm font-medium text-[var(--foreground)]">
                    Comorbidades
                  </label>
                  <input
                    id="comorbidities"
                    name="comorbidities"
                    type="text"
                    value={formData.comorbidities}
                    onChange={handleChange}
                    placeholder="Ex: Diabetes, Hipertensao"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="medications" className="block text-sm font-medium text-[var(--foreground)]">
                    Medicacoes em Uso
                  </label>
                  <input
                    id="medications"
                    name="medications"
                    type="text"
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder="Ex: Metformina, Losartana"
                    className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--border)]">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)] transition"
              >
                Voltar
              </button>
              <button
                onClick={createCase}
                disabled={isLoading || !formData.chief_complaint}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Continuar para Imagens"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Images */}
      {step === 3 && caseId && (
        <div className="space-y-6">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Imagens da Lesao</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Adicione fotos claras e bem iluminadas da lesao
              </p>
            </div>

            <ImageUploader
              caseId={caseId}
              onImagesChange={setImages}
            />

            <div className="flex justify-between pt-4 border-t border-[var(--border)]">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--secondary)] transition"
              >
                Voltar
              </button>
              <button
                onClick={submitCase}
                disabled={images.length === 0}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
                Enviar para Triagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
