import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, "");
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function calculateAge(birthDate: string | Date): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getRiskLevelColor(level: string): string {
  const colors: Record<string, string> = {
    verde: "bg-green-500",
    amarelo_leve: "bg-yellow-400",
    amarelo_grave: "bg-orange-500",
    vermelho: "bg-red-500",
    urgencia: "bg-purple-600",
  };
  return colors[level] || "bg-gray-400";
}

export function getRiskLevelText(level: string): string {
  const texts: Record<string, string> = {
    verde: "Verde - Baixo Risco",
    amarelo_leve: "Amarelo Leve",
    amarelo_grave: "Amarelo Grave",
    vermelho: "Vermelho - Alto Risco",
    urgencia: "Urgencia",
  };
  return texts[level] || level;
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    aguardando_triagem: "Aguardando Triagem",
    em_analise: "Em Analise",
    laudado: "Laudado",
    encaminhado: "Encaminhado",
    resolvido: "Resolvido",
    cancelado: "Cancelado",
  };
  return texts[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    aguardando_triagem: "bg-yellow-100 text-yellow-800",
    em_analise: "bg-blue-100 text-blue-800",
    laudado: "bg-green-100 text-green-800",
    encaminhado: "bg-purple-100 text-purple-800",
    resolvido: "bg-gray-100 text-gray-800",
    cancelado: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
