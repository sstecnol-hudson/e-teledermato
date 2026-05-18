"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { toast } from "sonner";

export function AnalyzeButton({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Implement API call for analysis
      toast.success("Análise iniciada");
    } catch (error) {
      toast.error("Erro ao iniciar análise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAnalyze}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
    >
      <Stethoscope className="h-5 w-5" />
      {loading ? "Analisando..." : "Análise de IA"}
    </button>
  );
}
