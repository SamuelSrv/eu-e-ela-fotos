"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { supabase } from "@/utils/supabase";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminHeader({
  titulo,
  email,
}: {
  titulo: string;
  email: string;
}) {
  const router = useRouter();

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">{titulo}</h1>
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
      </div>
      <AdminNav />
    </header>
  );
}