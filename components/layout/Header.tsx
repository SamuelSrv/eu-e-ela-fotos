"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SITE } from "@/lib/constants";

const links = [
  { href: "/", label: "Início" },
  { href: "/#quem-somos", label: "Quem Somos" },
  { href: "/#portfolio", label: "Portfólio" },
  { href: "/pacotes", label: "Pacotes" },
];

export default function Header() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setAberto(false)}
        >
          <Image
            src="/logo.jpeg"
            alt={`Logo ${SITE.nome}`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-accent/60"
            priority
          />
          <span className="font-serif text-lg tracking-wide">{SITE.nome}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/agendar"
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-strong"
          >
            Agendar
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-foreground md:hidden"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
          onClick={() => setAberto((v) => !v)}
        >
          {aberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {aberto && (
        <nav className="border-t border-line bg-background md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setAberto(false)}
                className="rounded-md px-3 py-3 text-muted hover:bg-surface hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/agendar"
              onClick={() => setAberto(false)}
              className="mt-2 rounded-full bg-accent px-5 py-3 text-center font-medium text-background"
            >
              Agendar
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}