"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarCheck, LoaderCircle, MessageCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { whatsappLink } from "@/lib/constants";
import {
  ENTRADA_PERCENTUAL,
  REGIOES_LABEL,
  TIPOS_EVENTO,
  brl,
  calcularPedido,
  pacotesPorTipo,
  type Precos,
  type Regiao,
} from "@/lib/pricing";

function isoLocal(d: Date) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function formatarData(iso: string) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

const schema = z
  .object({
    nome: z.string().trim().min(3, "Informe seu nome completo"),
    telefone: z.string().refine((v) => {
      const n = v.replace(/\D/g, "").length;
      return n === 10 || n === 11;
    }, "Informe o DDD e o número, ex: (51) 99999-9999"),
    tipo: z.string().min(1, "Selecione o tipo de evento"),
    pacote: z.string(),
    formandos: z.string(),
    data: z
      .string()
      .min(1, "Escolha a data do evento")
      .refine((v) => v > isoLocal(new Date()), "Escolha uma data a partir de amanhã"),
    horario: z.string().min(1, "Informe o horário"),
    regiao: z.string().min(1, "Selecione a região"),
    endereco: z.string().trim().min(5, "Informe o local do evento"),
    aceite: z.boolean().refine((v) => v === true, "É necessário aceitar as condições"),
  })
  .superRefine((v, ctx) => {
    if (v.tipo === "Formatura") {
      const n = Number(v.formandos);
      if (!Number.isInteger(n) || n < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["formandos"],
          message: "Informe o número de formandos",
        });
      }
    } else if (v.tipo && !v.pacote) {
      ctx.addIssue({ code: "custom", path: ["pacote"], message: "Selecione o pacote" });
    }
  });

type FormValues = z.infer<typeof schema>;

const inputCls =
  "w-full rounded-lg border border-line bg-surface-2 px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-accent";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-muted">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function AgendarForm({ precos }: { precos: Precos }) {
  const [minData, setMinData] = useState("");
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [linkWhats, setLinkWhats] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      nome: "",
      telefone: "",
      tipo: "",
      pacote: "",
      formandos: "",
      data: "",
      horario: "",
      regiao: "",
      endereco: "",
      aceite: false,
    },
  });

  useEffect(() => {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    setMinData(isoLocal(amanha));
  }, []);

  const tipo = watch("tipo");
  const calc = calcularPedido(precos, {
    tipo,
    pacote: watch("pacote"),
    formandos: watch("formandos"),
    regiao: watch("regiao"),
  });

  async function onSubmit(v: FormValues) {
    setErroEnvio(null);
    const r = calcularPedido(precos, v);

    if (r.total === null || r.taxa === null || r.descricaoPacote === null || r.entrada === null) {
      setErroEnvio("Não foi possível calcular o valor. Revise o pacote e a região.");
      return;
    }

    const regiaoLabel = REGIOES_LABEL[v.regiao as Regiao];
    const local = `${v.endereco.trim()} (${regiaoLabel})`;

    const { error } = await supabase.from("agendamentos").insert({
      nome_cliente: v.nome.trim(),
      telefone_cliente: v.telefone.trim(),
      tipo_evento: v.tipo,
      pacote_escolhido: r.descricaoPacote,
      data_evento: v.data,
      horario_evento: v.horario,
      local_evento: local,
      taxa_deslocamento: r.taxa,
      valor_total: r.total,
      status: "pendente",
    });

    if (error) {
      setErroEnvio("Não foi possível registrar seu pedido agora. Tente novamente em instantes.");
      return;
    }

    const mensagem = [
      "Olá! Acabei de fazer um pedido de agendamento no site da Eu & Ela Fotos.",
      "",
      `*Nome:* ${v.nome.trim()}`,
      `*Telefone:* ${v.telefone.trim()}`,
      `*Evento:* ${v.tipo}`,
      `*Pacote:* ${r.descricaoPacote}`,
      `*Data:* ${formatarData(v.data)}`,
      `*Horário:* ${v.horario}`,
      `*Local:* ${local}`,
      `*Deslocamento:* ${brl(r.taxa)}`,
      `*Total:* ${brl(r.total)}`,
      `*Entrada (${ENTRADA_PERCENTUAL}%):* ${brl(r.entrada)}`,
      "",
      "Aguardo a confirmação e as instruções para o pagamento da entrada (PIX/dinheiro).",
    ].join("\n");

    const link = whatsappLink(mensagem);
    setLinkWhats(link);
    window.location.assign(link);
  }

  if (linkWhats) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-10 text-center">
        <CalendarCheck className="mx-auto text-accent" size={40} />
        <h2 className="mt-5 font-serif text-3xl">Pedido registrado!</h2>
        <p className="mt-4 leading-relaxed text-muted">
          Estamos abrindo o WhatsApp com o resumo do seu pedido. A data só é
          reservada após a confirmação e o pagamento da entrada.
        </p>
        <a
          href={linkWhats}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-medium text-background hover:bg-accent-strong"
        >
          <MessageCircle size={18} />
          Abrir WhatsApp
        </a>
      </div>
    );
  }

  const opcoesPacote = pacotesPorTipo(precos, tipo);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 rounded-2xl border border-line bg-surface p-6 sm:p-8"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nome completo" error={errors.nome?.message}>
            <input className={inputCls} autoComplete="name" {...register("nome")} />
          </Field>
          <Field label="Telefone / WhatsApp" error={errors.telefone?.message}>
            <input
              className={inputCls}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(51) 99999-9999"
              {...register("telefone")}
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Tipo de evento" error={errors.tipo?.message}>
            <select
              className={inputCls}
              {...register("tipo", {
                onChange: () => {
                  setValue("pacote", "");
                  setValue("formandos", "");
                },
              })}
            >
              <option value="">Selecione...</option>
              {TIPOS_EVENTO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          {tipo === "Formatura" ? (
            <Field label="Número de formandos" error={errors.formandos?.message}>
              <input
                className={inputCls}
                type="number"
                min={1}
                inputMode="numeric"
                placeholder={`Ex: ${precos.config.formaturaLimite}`}
                {...register("formandos")}
              />
            </Field>
          ) : (
            <Field label="Pacote" error={errors.pacote?.message}>
              <select className={inputCls} disabled={!tipo} {...register("pacote")}>
                <option value="">{tipo ? "Selecione..." : "Escolha o tipo primeiro"}</option>
                {opcoesPacote.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({brl(p.preco)})
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Data do evento" error={errors.data?.message}>
            <input className={inputCls} type="date" min={minData} {...register("data")} />
          </Field>
          <Field label="Horário" error={errors.horario?.message}>
            <input className={inputCls} type="time" {...register("horario")} />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Região do evento" error={errors.regiao?.message}>
            <select className={inputCls} {...register("regiao")}>
              <option value="">Selecione...</option>
              {(Object.keys(REGIOES_LABEL) as Regiao[]).map((key) => {
                const taxa = precos.config.taxas[key];
                return (
                  <option key={key} value={key}>
                    {REGIOES_LABEL[key]} {taxa === 0 ? "(sem taxa)" : `(+ ${brl(taxa)})`}
                  </option>
                );
              })}
            </select>
          </Field>
          <Field label="Endereço / local" error={errors.endereco?.message}>
            <input
              className={inputCls}
              placeholder="Rua, número, bairro ou nome do local"
              {...register("endereco")}
            />
          </Field>
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[var(--accent)]"
              {...register("aceite")}
            />
            <span>
              Estou ciente de que a data só é reservada com entrada de{" "}
              {ENTRADA_PERCENTUAL}% (PIX ou dinheiro), sem devolução em caso de
              cancelamento, e que a entrega é somente digital, via link do
              Google Drive.
            </span>
          </label>
          {errors.aceite && (
            <p className="mt-1.5 text-sm text-red-400">{errors.aceite.message}</p>
          )}
        </div>

        {erroEnvio && (
          <p className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {erroEnvio}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 font-medium text-background transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <MessageCircle size={18} />
              Enviar pedido e continuar no WhatsApp
            </>
          )}
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-line bg-surface-2 p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-xl">Resumo do pedido</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Pacote</dt>
            <dd className="text-right">{calc.descricaoPacote ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Valor do pacote</dt>
            <dd>{calc.valorPacote !== null ? brl(calc.valorPacote) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Deslocamento</dt>
            <dd>{calc.taxa !== null ? (calc.taxa === 0 ? "Sem taxa" : brl(calc.taxa)) : "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
            <dt>Total</dt>
            <dd className="font-medium text-accent">
              {calc.total !== null ? brl(calc.total) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Entrada ({ENTRADA_PERCENTUAL}%)</dt>
            <dd>{calc.entrada !== null ? brl(calc.entrada) : "—"}</dd>
          </div>
        </dl>
        <p className="mt-5 text-xs leading-relaxed text-muted">
          Valor estimado. A reserva é confirmada após o pagamento da entrada.
        </p>
      </aside>
    </div>
  );
}