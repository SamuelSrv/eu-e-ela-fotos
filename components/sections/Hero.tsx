import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,110,0.16),transparent_60%)]"
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 md:py-32">
        <Image
          src="/logo.jpeg"
          alt={`Logo ${SITE.nome}`}
          width={160}
          height={160}
          priority
          className="h-36 w-36 rounded-full object-cover ring-2 ring-accent/60 ring-offset-4 ring-offset-background md:h-40 md:w-40"
        />
        <p className="mt-8 text-sm uppercase tracking-[0.3em] text-accent">
          Fotografia em Guaíba e região
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
          Momentos que merecem ser lembrados para sempre
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Ensaios, eventos esportivos e formaturas registrados com cuidado,
          luz natural e um olhar atento a cada detalhe.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/agendar"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-3 font-medium text-background transition-colors hover:bg-accent-strong"
          >
            Agendar sessão
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/pacotes"
            className="inline-flex items-center justify-center rounded-full border border-line px-8 py-3 font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            Ver pacotes
          </Link>
        </div>
      </div>
    </section>
  );
}