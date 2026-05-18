import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  // Se o perfil não existe ainda, cria automaticamente (primeiro acesso)
  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user!.id,
        email: user!.email ?? "",
        full_name: user!.user_metadata?.full_name ?? user!.email?.split("@")[0] ?? "Usuário",
        role: "solicitante" as const,
        is_active: true,
      })
      .select("*")
      .single();

    profile = newProfile;
  }

  // Se ainda assim não conseguiu perfil, redireciona para login
  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      <Sidebar user={profile} />
      <main className="flex-1 lg:pl-0 pl-0">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
