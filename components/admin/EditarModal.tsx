"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle, X } from "lucide-react";
import { supabase, type Agendamento } from "@/utils/supabase";
import { TIPOS_EVENTO } from "@/lib/pricing";

const schema = z.object({
    nome_cliente: z.string().trim().min(3, "Informe o nome"),
    telefone_cliente: z.string().trim().min(8, "Informe o telefone"),
    tipo_evento: z.string().min(1, "Selecione o tipo"),
    pacote_escolhido: z.string().trim().min(1, "Informe o pacote"),
    data_evento: z.string().min(1, "Informe a data"),
    horario_evento: z.string().min(1, "Informe o horário"),
    local_evento: z.string().trim().min(3, "Informe o local"),
    taxa_deslocamento: z.string().refine((v) => {
        const n = Number(v.replace(",", "."));
        return v.trim() !== "" && !Number.isNaN(n) && n >= 0;
    }, "Valor inválido"),
    valor_total: z.string().refine((v) => {
        const n = Number(v.replace(",", "."));
        return v.trim() !== "" && !Number.isNaN(n) && n >= 0;
    }, "Valor inválido"),
    status: z.enum(["pendente", "confirmado", "concluido"]),
});

type FormValues = z.infer<typeof schema>;

const inputCls =
    "w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent";

function Campo({
    label,
    erro,
    children,
}: {
    label: string;
    erro?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted">
                {label}
            </label>
            {children}
            {erro && <p className="mt-1 text-xs text-red-400">{erro}</p>}
        </div>
    );
}

export default function EditarModal({
    item,
    onClose,
    onSalvo,
}: {
    item: Agendamento;
    onClose: () => void;
    onSalvo: (a: Agendamento) => void;
}) {
    const [erro, setErro] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            nome_cliente: item.nome_cliente,
            telefone_cliente: item.telefone_cliente,
            tipo_evento: item.tipo_evento,
            pacote_escolhido: item.pacote_escolhido,
            data_evento: item.data_evento,
            horario_evento: item.horario_evento.slice(0, 5),
            local_evento: item.local_evento,
            taxa_deslocamento: String(Number(item.taxa_deslocamento)),
            valor_total: String(Number(item.valor_total)),
            status: item.status,
        },
    });

    useEffect(() => {
        const fechar = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", fechar);
        return () => window.removeEventListener("keydown", fechar);
    }, [onClose]);

    const tipos = TIPOS_EVENTO.map((t) => t.value as string);
    if (!tipos.includes(item.tipo_evento)) tipos.push(item.tipo_evento);

    async function onSubmit(v: FormValues) {
        setErro(null);
        const { data, error } = await supabase
            .from("agendamentos")
            .update({
                nome_cliente: v.nome_cliente.trim(),
                telefone_cliente: v.telefone_cliente.trim(),
                tipo_evento: v.tipo_evento,
                pacote_escolhido: v.pacote_escolhido.trim(),
                data_evento: v.data_evento,
                horario_evento: v.horario_evento,
                local_evento: v.local_evento.trim(),
                taxa_deslocamento: Number(v.taxa_deslocamento.replace(",", ".")),
                valor_total: Number(v.valor_total.replace(",", ".")),
                status: v.status,
            })
            .eq("id", item.id)
            .select()
            .single();

        if (error || !data) {
            setErro("Não foi possível salvar. Verifique sua sessão e tente novamente.");
            return;
        }
        onSalvo(data as Agendamento);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center">
            <div className="w-full max-w-2xl rounded-2xl border border-line bg-surface p-6 sm:p-8">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl">Editar agendamento</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                        className="rounded-md p-1.5 text-muted hover:text-foreground"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Campo label="Nome" erro={errors.nome_cliente?.message}>
                            <input className={inputCls} {...register("nome_cliente")} />
                        </Campo>
                        <Campo label="Telefone" erro={errors.telefone_cliente?.message}>
                            <input className={inputCls} {...register("telefone_cliente")} />
                        </Campo>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Campo label="Tipo de evento" erro={errors.tipo_evento?.message}>
                            <select className={inputCls} {...register("tipo_evento")}>
                                {tipos.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </Campo>
                        <Campo label="Pacote" erro={errors.pacote_escolhido?.message}>
                            <input className={inputCls} {...register("pacote_escolhido")} />
                        </Campo>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <Campo label="Data" erro={errors.data_evento?.message}>
                            <input type="date" className={inputCls} {...register("data_evento")} />
                        </Campo>
                        <Campo label="Horário" erro={errors.horario_evento?.message}>
                            <input type="time" className={inputCls} {...register("horario_evento")} />
                        </Campo>
                    </div>

                    <Campo label="Local" erro={errors.local_evento?.message}>
                        <input className={inputCls} {...register("local_evento")} />
                    </Campo>

                    <div className="grid gap-5 sm:grid-cols-3">
                        <Campo label="Deslocamento (R$)" erro={errors.taxa_deslocamento?.message}>
                            <input
                                inputMode="decimal"
                                className={inputCls}
                                {...register("taxa_deslocamento")}
                            />
                        </Campo>
                        <Campo label="Valor total (R$)" erro={errors.valor_total?.message}>
                            <input
                                inputMode="decimal"
                                className={inputCls}
                                {...register("valor_total")}
                            />
                        </Campo>
                        <Campo label="Status">
                            <select className={inputCls} {...register("status")}>
                                <option value="pendente">Pendente</option>
                                <option value="confirmado">Confirmado</option>
                                <option value="concluido">Concluído</option>
                            </select>
                        </Campo>
                    </div>

                    {erro && (
                        <p className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                            {erro}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full border border-line px-6 py-2.5 text-sm text-muted hover:text-foreground"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-background hover:bg-accent-strong disabled:opacity-60"
                        >
                            {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
                            Salvar alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}