"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, LoaderCircle, Trash2, Upload } from "lucide-react";
import { supabase, type FotoPortfolio } from "@/utils/supabase";
import {
  BUCKET_PORTFOLIO,
  MAX_FOTOS_PORTFOLIO,
  urlFotoPortfolio,
} from "@/lib/storage";
import AdminHeader from "@/components/admin/AdminHeader";

async function comprimirImagem(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const maxLado = 2560;
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("navegador sem suporte a imagens");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.92)
  );
  if (!blob) throw new Error("não foi possível converter a imagem");
  return blob;
}

export default function FotosClient({
  email,
  inicial,
}: {
  email: string;
  inicial: FotoPortfolio[];
}) {
  const [fotos, setFotos] = useState<FotoPortfolio[]>(inicial);
  const [enviando, setEnviando] = useState<{ atual: number; total: number } | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState<FotoPortfolio | null>(null);

  const vagas = MAX_FOTOS_PORTFOLIO - fotos.length;

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (arquivos.length === 0) return;

    setErros([]);

    if (vagas <= 0) {
      setErros([
        `Limite de ${MAX_FOTOS_PORTFOLIO} fotos atingido. Remova alguma para enviar novas.`,
      ]);
      return;
    }

    const lote = arquivos.slice(0, vagas);
    const novosErros: string[] = [];
    if (arquivos.length > vagas) {
      novosErros.push(
        `Só havia espaço para ${vagas} foto(s); as demais foram ignoradas.`
      );
    }

    let ordemAtual = fotos.reduce((m, f) => Math.max(m, f.ordem), -1);
    const enviadas: FotoPortfolio[] = [];

    for (let i = 0; i < lote.length; i++) {
      const arq = lote[i];
      setEnviando({ atual: i + 1, total: lote.length });

      try {
        if (!arq.type.startsWith("image/")) throw new Error("não é uma imagem");
        if (arq.size > 25 * 1024 * 1024) throw new Error("arquivo maior que 25 MB");

        let blob: Blob;
        try {
          blob = await comprimirImagem(arq);
        } catch {
          throw new Error("formato não suportado (use JPG, PNG ou WEBP)");
        }

        const caminho = `${crypto.randomUUID()}.webp`;

        const { error: erroUpload } = await supabase.storage
          .from(BUCKET_PORTFOLIO)
          .upload(caminho, blob, {
            contentType: "image/webp",
            cacheControl: "31536000",
          });
        if (erroUpload) throw new Error("falha no envio");

        ordemAtual += 1;
        const { data, error: erroInsert } = await supabase
          .from("portfolio_fotos")
          .insert({ caminho, ordem: ordemAtual })
          .select()
          .single();

        if (erroInsert || !data) {
          await supabase.storage.from(BUCKET_PORTFOLIO).remove([caminho]);
          throw new Error("falha ao registrar a foto");
        }

        enviadas.push(data as FotoPortfolio);
      } catch (err) {
        novosErros.push(`${arq.name}: ${err instanceof Error ? err.message : "erro"}`);
      }
    }

    setEnviando(null);
    if (enviadas.length > 0) setFotos((prev) => [...prev, ...enviadas]);
    setErros(novosErros);
  }

  async function remover(f: FotoPortfolio) {
    setErros([]);
    setRemovendo(null);
    setOcupado(f.id);

    const { data, error } = await supabase
      .from("portfolio_fotos")
      .delete()
      .eq("id", f.id)
      .select("id");

    if (error || !data || data.length === 0) {
      setErros(["Não foi possível remover a foto."]);
      setOcupado(null);
      return;
    }

    await supabase.storage.from(BUCKET_PORTFOLIO).remove([f.caminho]);
    setFotos((prev) => prev.filter((x) => x.id !== f.id));
    setOcupado(null);
  }

  async function mover(indice: number, delta: -1 | 1) {
    const alvo = indice + delta;
    if (alvo < 0 || alvo >= fotos.length) return;

    const antes = new Map(fotos.map((f) => [f.id, f.ordem]));
    const nova = [...fotos];
    [nova[indice], nova[alvo]] = [nova[alvo], nova[indice]];
    const reordenadas = nova.map((f, i) => ({ ...f, ordem: i }));

    setErros([]);
    setFotos(reordenadas);

    const alterados = reordenadas.filter((f) => antes.get(f.id) !== f.ordem);
    const resultados = await Promise.all(
      alterados.map((f) =>
        supabase.from("portfolio_fotos").update({ ordem: f.ordem }).eq("id", f.id)
      )
    );

    if (resultados.some((r) => r.error)) {
      setFotos(fotos);
      setErros(["Não foi possível salvar a nova ordem."]);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <AdminHeader titulo="Fotos do portfólio" email={email} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {fotos.length} de {MAX_FOTOS_PORTFOLIO} fotos. A ordem abaixo é a
          mesma exibida no site.
        </p>

        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-strong ${
            enviando || vagas <= 0 ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {enviando ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Enviando {enviando.atual} de {enviando.total}...
            </>
          ) : (
            <>
              <Upload size={16} />
              Adicionar fotos
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={aoEscolher}
            disabled={!!enviando || vagas <= 0}
          />
        </label>
      </div>

      {erros.length > 0 && (
        <ul className="mt-5 space-y-1 rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {erros.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}

      {fotos.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line py-20 text-center text-muted">
          Nenhuma foto ainda. Clique em &quot;Adicionar fotos&quot; para começar.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {fotos.map((f, i) => (
            <div
              key={f.id}
              className="overflow-hidden rounded-xl border border-line bg-surface"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={urlFotoPortfolio(f.caminho)}
                  alt={`Foto ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                />
                {ocupado === f.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <LoaderCircle className="animate-spin text-accent" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    aria-label="Mover para antes"
                    className="rounded-md p-1.5 text-muted hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === fotos.length - 1}
                    aria-label="Mover para depois"
                    className="rounded-md p-1.5 text-muted hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setRemovendo(f)}
                  aria-label="Remover foto"
                  className="rounded-md p-1.5 text-muted hover:text-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {removendo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-serif text-2xl">Remover esta foto?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A foto sai do site e é apagada definitivamente.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemovendo(null)}
                className="rounded-full border border-line px-5 py-2 text-sm text-muted hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => remover(removendo)}
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-400"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}