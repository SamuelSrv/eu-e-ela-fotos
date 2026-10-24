import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase-server";
import DashboardClient from "@/components/admin/DashboardClient";
import type { Agendamento } from "@/utils/supabase";

async function DashboardDados() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .order("data_evento", { ascending: true })
    .order("horario_evento", { ascending: true });

  return (
    <DashboardClient
      email={user.email ?? ""}
      inicial={(data ?? []) as Agendamento[]}
      erroCarga={error ? "Não foi possível carregar os agendamentos." : null}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <p className="py-24 text-center text-muted">Carregando painel...</p>
      }
    >
      <DashboardDados />
    </Suspense>
  );
}