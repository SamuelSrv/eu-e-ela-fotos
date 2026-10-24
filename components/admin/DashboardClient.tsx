"use client";

import AdminNav from "@/components/admin/AdminNav";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  CheckCheck,
  ExternalLink,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import {
  supabase,
  type Agendamento,
  type StatusAgendamento,
} from "@/utils/supabase";
import { ENTRADA_PERCENTUAL, brl } from "@/lib/pricing";
import EditarModal from "@/components/admin/EditarModal";


const STATUS: Record<StatusAgendamento, { label: string; cls: string }> = {
  pendente: {
    label: "Pendente",
    cls: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  confirmado: {
    label: "Confirmado",
    cls: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  concluido: {
    label: "Concluído",
    cls: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  },
};

type Filtro = "todos" | StatusAgendamento;

function formatarData(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function linkWhatsCliente(telefone: string) {
  const d = telefone.replace(/\D/g, "");
  const numero = d.startsWith("55") && d.length >= 12 ? d : `55${d}`;
  return `https://wa.me/${numero}`;
}

export default function DashboardClient({
  email,
  inicial,
  erroCarga,
}: {
  email: string;
  inicial: Agendamento[];
  erroCarga: string | null;
}) {
  const router = useRouter();
  const [itens, setItens] = useState<Agendamento[]>(inicial);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Agendamento | null>(null);
  const [excluindo, setExcluindo] = useState<Agendamento | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(erroCarga);

  const contagem = useMemo(() => {
    const c = { todos: itens.length, pendente: 0, confirmado: 0, concluido: 0 };
    itens.forEach((i) => (c[i.status] += 1));
    return c;
  }, [itens]);

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((i) => {
      if (filtro !== "todos" && i.status !== filtro) return false;
      if (!q) return true;
      return (
        i.nome_cliente.toLowerCase().includes(q) ||
        i.telefone_cliente.toLowerCase().includes(q)
      );
    });
  }, [itens, filtro, busca]);

  async function mudarStatus(id: string, status: StatusAgendamento) {
    setErro(null);
    setOcupado(id);
    const { data, error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    setOcupado(null);

    if (error || !data) {
      setErro("Não foi possível atualizar o status. Verifique sua sessão.");
      return;
    }
    setItens((prev) => prev.map((i) => (i.id === id ? (data as Agendamento) : i)));
  }

  async function excluir(a: Agendamento) {
    setErro(null);
    setOcupado(a.id);
    const { data, error } = await supabase
      .from("agendamentos")
      .delete()
      .eq("id", a.id)
      .select("id");
    setOcupado(null);
    setExcluindo(null);

    if (error || !data || data.length === 0) {
      setErro("Não foi possível excluir o agendamento.");
      return;
    }
    setItens((prev) => prev.filter((i) => i.id !== a.id));
  }

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const filtros: { id: Filtro; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "pendente", label: "Pendentes" },
    { id: "confirmado", label: "Confirmados" },
    { id: "concluido", label: "Concluídos" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-serif text-3xl">Painel de agendamentos</h1>
          <p className="mt-1 text-sm text-muted">Conectado como {email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-foreground"
          >
            <ExternalLink size={16} />
            Ver site
          </Link>
          <button
            type="button"
            onClick={sair}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted hover:border-accent hover:text-accent"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
        <AdminNav />
      </header>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                filtro === f.id
                  ? "border-accent bg-accent text-background"
                  : "border-line text-muted hover:text-foreground"
              }`}
            >
              {f.label} ({contagem[f.id]})
            </button>
          ))}
        </div>

        <div className="relative md:w-72">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou telefone"
            className="w-full rounded-full border border-line bg-surface-2 py-2 pl-9 pr-4 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {erro && (
        <p className="mt-5 rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {erro}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {visiveis.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line py-16 text-center text-muted">
            Nenhum agendamento encontrado.
          </p>
        )}

        {visiveis.map((a) => {
          const st = STATUS[a.status];
          const entrada = (Number(a.valor_total) * ENTRADA_PERCENTUAL) / 100;
          const trabalhando = ocupado === a.id;

          return (
            <article
              key={a.id}
              className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-xl">{a.nome_cliente}</h2>
                  <a
                    href={linkWhatsCliente(a.telefone_cliente)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent"
                  >
                    <MessageCircle size={14} />
                    {a.telefone_cliente}
                  </a>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${st.cls}`}
                >
                  {st.label}
                </span>
              </div>

              <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Evento</dt>
                  <dd className="mt-0.5">{a.tipo_evento}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Pacote</dt>
                  <dd className="mt-0.5">{a.pacote_escolhido}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Data e hora</dt>
                  <dd className="mt-0.5">
                    {formatarData(a.data_evento)} às {a.horario_evento.slice(0, 5)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Local</dt>
                  <dd className="mt-0.5">{a.local_evento}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Deslocamento</dt>
                  <dd className="mt-0.5">
                    {Number(a.taxa_deslocamento) === 0
                      ? "Sem taxa"
                      : brl(Number(a.taxa_deslocamento))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">Total</dt>
                  <dd className="mt-0.5 font-medium text-accent">
                    {brl(Number(a.valor_total))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">
                    Entrada ({ENTRADA_PERCENTUAL}%)
                  </dt>
                  <dd className="mt-0.5">{brl(entrada)}</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                {trabalhando && (
                  <LoaderCircle size={18} className="animate-spin text-accent" />
                )}

                {a.status === "pendente" && (
                  <button
                    type="button"
                    disabled={trabalhando}
                    onClick={() => mudarStatus(a.id, "confirmado")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background hover:bg-accent-strong disabled:opacity-60"
                  >
                    <Check size={16} />
                    Confirmar
                  </button>
                )}
                {a.status === "confirmado" && (
                  <button
                    type="button"
                    disabled={trabalhando}
                    onClick={() => mudarStatus(a.id, "concluido")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-background hover:bg-accent-strong disabled:opacity-60"
                  >
                    <CheckCheck size={16} />
                    Marcar como concluído
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setEditando(a)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-sm text-muted hover:text-foreground"
                >
                  <Pencil size={15} />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setExcluindo(a)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-sm text-muted hover:border-red-400/60 hover:text-red-300"
                >
                  <Trash2 size={15} />
                  Excluir
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {editando && (
        <EditarModal
          item={editando}
          onClose={() => setEditando(null)}
          onSalvo={(novo) => {
            setItens((prev) => prev.map((i) => (i.id === novo.id ? novo : i)));
            setEditando(null);
          }}
        />
      )}

      {excluindo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-serif text-2xl">Excluir agendamento?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              O agendamento de <strong className="text-foreground">{excluindo.nome_cliente}</strong>{" "}
              em {formatarData(excluindo.data_evento)} será removido
              definitivamente. Essa ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setExcluindo(null)}
                className="rounded-full border border-line px-5 py-2 text-sm text-muted hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => excluir(excluindo)}
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-400"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}