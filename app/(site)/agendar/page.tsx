import type { Metadata } from "next";
import { Suspense } from "react";
import AgendarForm from "@/components/agendar/AgendarForm";
import { carregarPrecos } from "@/lib/precos";

export const metadata: Metadata = {
  title: "Agendar sessão | Eu & Ela Fotos",
  description: "Faça seu pedido de agendamento e finalize pelo WhatsApp.",
};

async function FormularioComPrecos() {
  const precos = await carregarPrecos();
  return <AgendarForm precos={precos} />;
}

export default function AgendarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-accent">Agendamento</p>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Agende sua sessão</h1>
        <p className="mt-5 leading-relaxed text-muted">
          Preencha os dados abaixo. Ao enviar, seu pedido é registrado e você
          segue direto para o WhatsApp com o resumo pronto.
        </p>
      </div>

      <Suspense
        fallback={<p className="py-16 text-center text-muted">Carregando formulário...</p>}
      >
        <FormularioComPrecos />
      </Suspense>
    </div>
  );
}