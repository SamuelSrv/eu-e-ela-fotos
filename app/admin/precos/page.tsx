import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase-server";
import PrecosClient, { type PacoteDb } from "@/components/admin/PrecosClient";

async function PrecosDados() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const [pacotesRes, configRes] = await Promise.all([
    supabase
      .from("pacotes")
      .select("*")
      .order("preco", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("configuracoes").select("chave, valor"),
  ]);

  const pacotes = ((pacotesRes.data ?? []) as PacoteDb[]).map((p) => ({
    ...p,
    preco: Number(p.preco),
  }));

  const config: Record<string, number> = {};
  (configRes.data ?? []).forEach((c: { chave: string; valor: number }) => {
    config[c.chave] = Number(c.valor);
  });

  return (
    <PrecosClient
      email={user.email ?? ""}
      pacotesIniciais={pacotes}
      configInicial={config}
      erroCarga={
        pacotesRes.error || configRes.error
          ? "Não foi possível carregar os preços. Confira se o SQL do Passo 7 foi executado."
          : null
      }
    />
  );
}

export default function PrecosPage() {
  return (
    <Suspense
      fallback={<p className="py-24 text-center text-muted">Carregando preços...</p>}
    >
      <PrecosDados />
    </Suspense>
  );
}