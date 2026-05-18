"use client";

import { FileText } from "lucide-react";
import Link from "next/link";

export function CreateReportButton({ caseId }: { caseId: string }) {
  return (
    <Link
      href={`/dashboard/casos/${caseId}/laudo`}
      className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition"
    >
      <FileText className="h-5 w-5" />
      Criar Laudo Médico
    </Link>
  );
}
