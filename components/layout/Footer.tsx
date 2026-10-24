import Link from "next/link";
import { Camera, Lock, MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/constants";
import AnoAtual from "@/components/layout/AnoAtual";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl">{SITE.nome}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Fotografia com sensibilidade e cuidado em Guaíba, Porto Alegre e
            Região Metropolitana.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Navegação
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <Link href="/#quem-somos" className="hover:text-foreground">
                Quem Somos
              </Link>
            </li>
            <li>
              <Link href="/#portfolio" className="hover:text-foreground">
                Portfólio
              </Link>
            </li>
            <li>
              <Link href="/pacotes" className="hover:text-foreground">
                Pacotes e valores
              </Link>
            </li>
            <li>
              <Link href="/agendar" className="hover:text-foreground">
                Agendar sessão
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Contato
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted transition-colors hover:text-foreground"
              >
                <MessageCircle size={18} className="text-accent" />
                WhatsApp: {SITE.whatsappExibicao}
              </a>
            </li>
            <li>
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted transition-colors hover:text-foreground"
              >
                <Camera size={18} className="text-accent" />
                Instagram: {SITE.instagramUser}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6">
          <p>
            © <AnoAtual /> {SITE.nome}. Todos os direitos reservados.
          </p>
          <Link
            href="/admin/login"
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 transition-colors hover:border-accent hover:text-accent"
          >
            <Lock size={13} />
            Área restrita
          </Link>
        </div>
      </div>
    </footer>
  );
}