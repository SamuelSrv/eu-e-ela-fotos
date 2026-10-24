"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function GaleriaFotos({ fotos }: { fotos: string[] }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const toqueInicial = useRef<number | null>(null);

  const fechar = useCallback(() => setAberta(null), []);
  const anterior = useCallback(
    () => setAberta((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length)),
    [fotos.length]
  );
  const proxima = useCallback(
    () => setAberta((i) => (i === null ? null : (i + 1) % fotos.length)),
    [fotos.length]
  );

  useEffect(() => {
    if (aberta === null) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    };

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = overflowOriginal;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberta, fechar, anterior, proxima]);

  return (
    <>
      {fotos.map((src, i) => (
        <button
          key={src}
          type="button"
          onClick={() => setAberta(i)}
          aria-label={`Ampliar foto ${i + 1}`}
          className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-xl border border-line bg-surface"
        >
          <Image
            src={src}
            alt={`Foto do portfólio ${i + 1}`}
            fill
            quality={90}
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>
      ))}

      {aberta !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          className="fixed inset-0 z-[100] bg-black/95"
          onClick={fechar}
          onTouchStart={(e) => {
            toqueInicial.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (toqueInicial.current === null) return;
            const dx = e.changedTouches[0].clientX - toqueInicial.current;
            toqueInicial.current = null;
            if (dx > 60) anterior();
            if (dx < -60) proxima();
          }}
        >
          <div className="relative h-full w-full p-4 sm:p-10">
            <div className="relative h-full w-full">
              <Image
                key={fotos[aberta]}
                src={fotos[aberta]}
                alt={`Foto do portfólio ${aberta + 1}`}
                fill
                unoptimized
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fechar();
            }}
            aria-label="Fechar"
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2.5 text-white hover:bg-black/80"
          >
            <X size={24} />
          </button>

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  anterior();
                }}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white hover:bg-black/80"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  proxima();
                }}
                aria-label="Próxima foto"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white hover:bg-black/80"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}