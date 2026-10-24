"use client";

import { useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/utils/supabase";
import AdminHeader from "@/components/admin/AdminHeader";

export type PacoteDb = {
  id: string;
  categoria: "padrao" | "esportivo";
  nome: string;
  preco: number;
  ativo: boolean;
};

const inputCls =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

function paraNumero(v: string) {
  return Number(v.replace(",", "."));
}

function precoValido(v: string) {
  const n = paraNumero(v);
  return v.trim() !== "" && !Number.isNaN(n) && n >= 0;
}

function ordenar(lista: PacoteDb[]) {
  return [...lista].sort((a, b) => a.preco - b.preco || a.nome.localeCompare(b.nome));
}

function normalizar(p: PacoteDb): PacoteDb {
  return { ...p, preco: Number(p.preco) };
}

/* ---------- Linha de um pacote ---------- */
function LinhaPacote({
  pacote,
  onSalvo,
  onRemovido,
}: {
  pacote: PacoteDb;
  onSalvo: (p: PacoteDb) => void;
  onRemovido: (id: string) => void;
}) {
  const [nome, setNome] = useState(pacote.nome);
  const [preco, setPreco] = useState(String(pacote.preco));
  const [ativo, setAtivo] = useState(pacote.ativo);
  const [ocupado, setOcupado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const alterado =
    nome.trim() !== pacote.nome ||
    paraNumero(preco) !== pacote.preco ||
    ativo !== pacote.ativo;

  async function salvar() {
    if (nome.trim().length < 2) return setErro("Informe o nome do pacote.");
    if (!precoValido(preco)) return setErro("Preço inválido.");

    setErro(null);
    setOcupado(true);
    const { data, error } = await supabase
      .from("pacotes")
      .update({ nome: nome.trim(), preco: paraNumero(preco), ativo })
      .eq("id", pacote.id)
      .select()
      .single();
    setOcupado(false);

    if (error || !data) return setErro("Não foi possível salvar.");
    onSalvo(normalizar(data as PacoteDb));
  }

  async function remover() {
    setErro(null);
    setOcupado(true);
    const { data, error } = await supabase
      .from("pacotes")
      .delete()
      .eq("id", pacote.id)
      .select("id");
    setOcupado(false);

    if (error || !data || data.length === 0) {
      setConfirmando(false);
      return setErro("Não foi possível remover.");
    }
    onRemovido(pacote.id);
  }

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-center">
        <input
          className={inputCls}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          aria-label="Nome do pacote"
        />
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
            R$
          </span>
          <input
            className={`${inputCls} pl-9`}
            value={preco}
            inputMode="decimal"
            onChange={(e) => setPreco(e.target.value)}
            aria-label="Preço"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Ativo no site
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {ocupado && <LoaderCircle size={16} className="animate-spin text-accent" />}

        <button
          type="button"
          onClick={salvar}
          disabled={!alterado || ocupado}
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background hover:bg-accent-strong disabled:opacity-40"
        >
          Salvar
        </button>

        {confirmando ? (
          <>
            <span className="text-sm text-muted">Remover este pacote?</span>
            <button
              type="button"
              onClick={remover}
              disabled={ocupado}
              className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-400"
            >
              Sim, remover
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-muted hover:text-foreground"
            >
              Não
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            disabled={ocupado}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-sm text-muted hover:border-red-400/60 hover:text-red-300"
          >
            <Trash2 size={15} />
            Remover
          </button>
        )}

        {erro && <span className="text-sm text-red-400">{erro}</span>}
      </div>
    </div>
  );
}

/* ---------- Novo pacote ---------- */
function NovoPacote({
  categoria,
  onCriado,
}: {
  categoria: "padrao" | "esportivo";
  onCriado: (p: PacoteDb) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar() {
    if (nome.trim().length < 2) return setErro("Informe o nome do pacote.");
    if (!precoValido(preco)) return setErro("Preço inválido.");

    setErro(null);
    setOcupado(true);
    const { data, error } = await supabase
      .from("pacotes")
      .insert({ categoria, nome: nome.trim(), preco: paraNumero(preco) })
      .select()
      .single();
    setOcupado(false);

    if (error || !data) return setErro("Não foi possível criar o pacote.");
    onCriado(normalizar(data as PacoteDb));
    setNome("");
    setPreco("");
    setAberto(false);
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent"
      >
        <Plus size={16} />
        Adicionar pacote
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-accent/40 bg-surface-2 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <input
          className={inputCls}
          placeholder="Nome (ex: 2 horas)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Preço (ex: 230)"
          inputMode="decimal"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {ocupado && <LoaderCircle size={16} className="animate-spin text-accent" />}
        <button
          type="button"
          onClick={criar}
          disabled={ocupado}
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background hover:bg-accent-strong disabled:opacity-40"
        >
          Criar pacote
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-full border border-line px-4 py-1.5 text-sm text-muted hover:text-foreground"
        >
          Cancelar
        </button>
        {erro && <span className="text-sm text-red-400">{erro}</span>}
      </div>
    </div>
  );
}

/* ---------- Seção de pacotes ---------- */
function SecaoPacotes({
  titulo,
  descricao,
  categoria,
  pacotes,
  setPacotes,
}: {
  titulo: string;
  descricao: string;
  categoria: "padrao" | "esportivo";
  pacotes: PacoteDb[];
  setPacotes: React.Dispatch<React.SetStateAction<PacoteDb[]>>;
}) {
  const lista = pacotes.filter((p) => p.categoria === categoria);

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="font-serif text-2xl">{titulo}</h2>
      <p className="mt-1 text-sm text-muted">{descricao}</p>

      <div className="mt-5 space-y-3">
        {lista.length === 0 && (
          <p className="text-sm text-muted">Nenhum pacote nesta categoria.</p>
        )}
        {lista.map((p) => (
          <LinhaPacote
            key={p.id}
            pacote={p}
            onSalvo={(novo) =>
              setPacotes((prev) => ordenar(prev.map((x) => (x.id === novo.id ? novo : x))))
            }
            onRemovido={(id) => setPacotes((prev) => prev.filter((x) => x.id !== id))}
          />
        ))}
        <NovoPacote
          categoria={categoria}
          onCriado={(novo) => setPacotes((prev) => ordenar([...prev, novo]))}
        />
      </div>
    </section>
  );
}

/* ---------- Grupo de valores numéricos ---------- */
type CampoConfig = { chave: string; label: string; tipo: "dinheiro" | "inteiro" };

function CartaoConfig({
  titulo,
  descricao,
  campos,
  valores,
  onSalvo,
}: {
  titulo: string;
  descricao: string;
  campos: CampoConfig[];
  valores: Record<string, number>;
  onSalvo: (novos: Record<string, number>) => void;
}) {
  const [rascunho, setRascunho] = useState<Record<string, string>>(
    Object.fromEntries(campos.map((c) => [c.chave, String(valores[c.chave] ?? 0)]))
  );
  const [ocupado, setOcupado] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const alterado = campos.some((c) => paraNumero(rascunho[c.chave]) !== valores[c.chave]);

  async function salvar() {
    for (const c of campos) {
      const v = rascunho[c.chave];
      if (!precoValido(v)) {
        return setMsg({ tipo: "erro", texto: `Valor inválido em "${c.label}".` });
      }
      if (c.tipo === "inteiro" && (!Number.isInteger(paraNumero(v)) || paraNumero(v) < 1)) {
        return setMsg({ tipo: "erro", texto: `"${c.label}" deve ser um número inteiro maior que zero.` });
      }
    }

    setMsg(null);
    setOcupado(true);

    const resultados = await Promise.all(
      campos.map((c) =>
        supabase
          .from("configuracoes")
          .update({ valor: paraNumero(rascunho[c.chave]) })
          .eq("chave", c.chave)
          .select("chave")
      )
    );
    setOcupado(false);

    if (resultados.some((r) => r.error || !r.data || r.data.length === 0)) {
      return setMsg({ tipo: "erro", texto: "Não foi possível salvar." });
    }

    onSalvo(Object.fromEntries(campos.map((c) => [c.chave, paraNumero(rascunho[c.chave])])));
    setMsg({ tipo: "ok", texto: "Salvo! O site já está atualizado." });
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="font-serif text-2xl">{titulo}</h2>
      <p className="mt-1 text-sm text-muted">{descricao}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {campos.map((c) => (
          <div key={c.chave}>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
              {c.label}
            </label>
            <input
              className={inputCls}
              inputMode={c.tipo === "inteiro" ? "numeric" : "decimal"}
              value={rascunho[c.chave]}
              onChange={(e) => setRascunho((r) => ({ ...r, [c.chave]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {ocupado && <LoaderCircle size={16} className="animate-spin text-accent" />}
        <button
          type="button"
          onClick={salvar}
          disabled={!alterado || ocupado}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-background hover:bg-accent-strong disabled:opacity-40"
        >
          Salvar
        </button>
        {msg && (
          <span className={`text-sm ${msg.tipo === "ok" ? "text-emerald-300" : "text-red-400"}`}>
            {msg.texto}
          </span>
        )}
      </div>
    </section>
  );
}

/* ---------- Tela ---------- */
export default function PrecosClient({
  email,
  pacotesIniciais,
  configInicial,
  erroCarga,
}: {
  email: string;
  pacotesIniciais: PacoteDb[];
  configInicial: Record<string, number>;
  erroCarga: string | null;
}) {
  const [pacotes, setPacotes] = useState<PacoteDb[]>(ordenar(pacotesIniciais));
  const [config, setConfig] = useState<Record<string, number>>(configInicial);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <AdminHeader titulo="Preços e pacotes" email={email} />

      <p className="mt-6 text-sm leading-relaxed text-muted">
        As alterações valem no site assim que você salva. Agendamentos já feitos
        mantêm o valor da época. Para tirar um pacote do site sem perdê-lo,
        desmarque &quot;Ativo no site&quot; em vez de remover.
      </p>

      {erroCarga && (
        <p className="mt-5 rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {erroCarga}
        </p>
      )}

      <div className="mt-6 space-y-6">
        <SecaoPacotes
          titulo="Pacotes Padrão"
          descricao="Usados nos ensaios e demais sessões."
          categoria="padrao"
          pacotes={pacotes}
          setPacotes={setPacotes}
        />

        <SecaoPacotes
          titulo="Pacotes Esportivos"
          descricao="Jogos, campeonatos e treinos."
          categoria="esportivo"
          pacotes={pacotes}
          setPacotes={setPacotes}
        />

        <CartaoConfig
          titulo="Formatura"
          descricao="Valor por formando. Acima do limite, todos os formandos pagam o valor reduzido."
          campos={[
            { chave: "formatura_limite", label: "Limite de formandos", tipo: "inteiro" },
            { chave: "formatura_preco_ate", label: "Valor até o limite (R$)", tipo: "dinheiro" },
            { chave: "formatura_preco_acima", label: "Valor acima do limite (R$)", tipo: "dinheiro" },
          ]}
          valores={config}
          onSalvo={(novos) => setConfig((c) => ({ ...c, ...novos }))}
        />

        <CartaoConfig
          titulo="Taxa de deslocamento"
          descricao="Somada ao valor do pacote, conforme a região do evento."
          campos={[
            { chave: "taxa_guaiba", label: "Guaíba (R$)", tipo: "dinheiro" },
            { chave: "taxa_porto_alegre", label: "Porto Alegre (R$)", tipo: "dinheiro" },
            { chave: "taxa_metropolitana", label: "Região Metropolitana (R$)", tipo: "dinheiro" },
          ]}
          valores={config}
          onSalvo={(novos) => setConfig((c) => ({ ...c, ...novos }))}
        />
      </div>
    </div>
  );
}