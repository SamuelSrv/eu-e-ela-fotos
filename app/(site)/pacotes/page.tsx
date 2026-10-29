import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  Camera,
  CreditCard,
  Download,
  GraduationCap,
  MapPin,
  MessageCircle,
  Trophy,
} from "lucide-react";
import {
  ENTRADA_PERCENTUAL,
  ENTREGA,
  REGIOES_LABEL,
  brl,
  pacotesPorTipo,
  type Regiao,
} from "@/lib/pricing";
import { carregarPrecos } from "@/lib/precos";
import { whatsappLink } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pacotes e valores | Eu & Ela Fotos",
  description:
    "Confira os pacotes de ensaio, esportivo e formatura, taxas de deslocamento e condições.",
};

function Linha({ nome, valor }: { nome: string; valor: string }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-0">
      <span className="text-muted">{nome}</span>
      <span className="font-medium text-foreground">{valor}</span>
    </li>
  );
}

async function Conteudo() {
  const precos = await carregarPrecos();
  const padrao = pacotesPorTipo(precos, "Ensaio");
  const esportivo = pacotesPorTipo(precos, "Esportivo");
  const { config } = precos;

  return (
    <>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-8">
          <Camera className="text-accent" size={28} />
          <h2 className="mt-4 font-serif text-2xl">Padrão</h2>
          <p className="mt-1 text-sm text-muted">Ensaios e demais sessões</p>
          <ul className="mt-6">
            {padrao.map((p) => (
              <Linha key={p.id} nome={p.nome} valor={brl(p.preco)} />
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-8">
          <Trophy className="text-accent" size={28} />
          <h2 className="mt-4 font-serif text-2xl">Esportivo</h2>
          <p className="mt-1 text-sm text-muted">Jogos, campeonatos e treinos</p>
          <ul className="mt-6">
            {esportivo.map((p) => (
              <Linha key={p.id} nome={p.nome} valor={brl(p.preco)} />
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-8">
          <GraduationCap className="text-accent" size={28} />
          <h2 className="mt-4 font-serif text-2xl">Formatura</h2>
          <p className="mt-1 text-sm text-muted">Valor por formando</p>
          <ul className="mt-6">
            <Linha
              nome={`Até ${config.formaturaLimite} formandos`}
              valor={`${brl(config.formaturaPrecoAte)} cada`}
            />
            <Linha
              nome={`Acima de ${config.formaturaLimite} formandos`}
              valor={`${brl(config.formaturaPrecoAcima)} cada`}
            />
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface-2 p-8">
          <CreditCard className="text-accent" size={26} />
          <h3 className="mt-4 font-serif text-xl">Pagamento</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Para reservar a data, é necessária uma entrada de{" "}
            <strong className="text-foreground">{ENTRADA_PERCENTUAL}%</strong> via
            PIX ou dinheiro. Em caso de cancelamento, a entrada não é devolvida.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface-2 p-8">
          <MapPin className="text-accent" size={26} />
          <h3 className="mt-4 font-serif text-xl">Deslocamento</h3>
          <ul className="mt-3 text-sm">
            {(Object.keys(REGIOES_LABEL) as Regiao[]).map((key) => (
              <Linha
                key={key}
                nome={REGIOES_LABEL[key]}
                valor={config.taxas[key] === 0 ? "Sem taxa" : brl(config.taxas[key])}
              />
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line bg-surface-2 p-8">
          <Download className="text-accent" size={26} />
          <h3 className="mt-4 font-serif text-xl">Entrega</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Entrega exclusivamente digital, por link do Google Drive ativo por{" "}
            {ENTREGA.validadeLinkDias} dias, em até {ENTREGA.prazoDiasUteis} dias
            úteis. Não realizamos impressão.
          </p>
        </div>
      </div>
    </>
  );
}

export default function PacotesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Pacotes</p>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Valores e condições</h1>
        <p className="mt-5 leading-relaxed text-muted">
          Escolha o pacote ideal para o seu momento. O valor final soma a taxa
          de deslocamento, de acordo com o local do evento.
        </p>
      </div>

      <Suspense
        fallback={<p className="mt-14 text-center text-muted">Carregando valores...</p>}
      >
        <Conteudo />
      </Suspense>

      <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/agendar"
          className="inline-flex rounded-full bg-accent px-8 py-3 font-medium text-background transition-colors hover:bg-accent-strong"
        >
          Agendar minha sessão
        </Link>
        <a
          href={whatsappLink("Olá! Tenho uma dúvida sobre os pacotes da Eu & Ela Fotos.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-line px-8 py-3 font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <MessageCircle size={18} />
          Tirar dúvidas no WhatsApp
        </a>
      </div>
    </div>
  );
}