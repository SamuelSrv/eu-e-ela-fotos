import { Camera, GraduationCap, Trophy } from "lucide-react";

const servicos = [
  {
    icon: Camera,
    titulo: "Ensaios",
    texto: "Sessões personalizadas, com direção leve e resultado natural.",
  },
  {
    icon: Trophy,
    titulo: "Esportivo",
    texto: "A emoção e a energia do jogo registradas no instante certo.",
  },
  {
    icon: GraduationCap,
    titulo: "Formatura",
    texto: "A conquista de uma etapa eternizada em fotos marcantes.",
  },
];

export default function About() {
  return (
    <section id="quem-somos" className="scroll-mt-20 border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">
            Quem Somos
          </p>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl">
            Fotografia feita com atenção e afeto
          </h2>
          <p className="mt-6 leading-relaxed text-muted">
            A Eu &amp; Ela Fotos nasceu do desejo de transformar momentos
            comuns em lembranças especiais. Atendemos Guaíba, Porto Alegre e
            Região Metropolitana, com entrega 100% digital em galeria online
            para você baixar, compartilhar e guardar suas fotos com
            praticidade.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {servicos.map(({ icon: Icon, titulo, texto }) => (
            <div
              key={titulo}
              className="rounded-2xl border border-line bg-surface-2 p-8 text-center transition-colors hover:border-accent/60"
            >
              <Icon className="mx-auto text-accent" size={32} />
              <h3 className="mt-5 font-serif text-xl">{titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}