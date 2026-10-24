import { connection } from "next/server";
import { createPublicClient } from "@/utils/supabase-public";
import { PRECOS_PADRAO, type Categoria, type Precos } from "@/lib/pricing";

type LinhaPacote = { id: string; categoria: string; nome: string; preco: number };
type LinhaConfig = { chave: string; valor: number };

export async function carregarPrecos(): Promise<Precos> {
  await connection();

  try {
    const supabase = createPublicClient();
    const [pacotesRes, configRes] = await Promise.all([
      supabase
        .from("pacotes")
        .select("id, categoria, nome, preco")
        .eq("ativo", true)
        .order("preco", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.from("configuracoes").select("chave, valor"),
    ]);

    if (
      pacotesRes.error ||
      configRes.error ||
      !pacotesRes.data ||
      pacotesRes.data.length === 0
    ) {
      return PRECOS_PADRAO;
    }

    const cfg = new Map<string, number>(
      ((configRes.data ?? []) as LinhaConfig[]).map((c) => [c.chave, Number(c.valor)])
    );
    const d = PRECOS_PADRAO.config;
    const pegar = (chave: string, padrao: number) => {
      const v = cfg.get(chave);
      return v !== undefined && !Number.isNaN(v) ? v : padrao;
    };

    return {
      pacotes: (pacotesRes.data as LinhaPacote[]).map((p) => ({
        id: p.id,
        categoria: p.categoria as Categoria,
        nome: p.nome,
        preco: Number(p.preco),
      })),
      config: {
        formaturaLimite: pegar("formatura_limite", d.formaturaLimite),
        formaturaPrecoAte: pegar("formatura_preco_ate", d.formaturaPrecoAte),
        formaturaPrecoAcima: pegar("formatura_preco_acima", d.formaturaPrecoAcima),
        taxas: {
          guaiba: pegar("taxa_guaiba", d.taxas.guaiba),
          "porto-alegre": pegar("taxa_porto_alegre", d.taxas["porto-alegre"]),
          metropolitana: pegar("taxa_metropolitana", d.taxas.metropolitana),
        },
      },
    };
  } catch {
    return PRECOS_PADRAO;
  }
}