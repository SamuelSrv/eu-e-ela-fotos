import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase-server";
import FotosClient from "@/components/admin/FotosClient";
import type { FotoPortfolio } from "@/utils/supabase";

async function FotosDados() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("portfolio_fotos")
    .select("*")
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <FotosClient
      email={user.email ?? ""}
      inicial={(data ?? []) as FotoPortfolio[]}
    />
  );
}

export default function FotosPage() {
  return (
    <Suspense
      fallback={<p className="py-24 text-center text-muted">Carregando fotos...</p>}
    >
      <FotosDados />
    </Suspense>
  );
}