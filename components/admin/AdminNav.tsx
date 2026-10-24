"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const abas = [
  { href: "/admin/dashboard", label: "Agendamentos" },
  { href: "/admin/fotos", label: "Fotos" },
  { href: "/admin/precos", label: "Preços" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex gap-2 border-b border-line">
      {abas.map((a) => {
        const ativa = pathname === a.href;
        return (
          <Link
            key={a.href}
            href={a.href}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
              ativa
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {a.label}
          </Link>
        );
      })}
    </nav>
  );
}