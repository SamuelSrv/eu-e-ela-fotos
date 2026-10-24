import { Suspense } from "react";
import { connection } from "next/server";
import { Camera } from "lucide-react";
import { createPublicClient } from "@/utils/supabase-public";
import { MAX_FOTOS_PORTFOLIO, urlFotoPortfolio } from "@/lib/storage";
import GaleriaFotos from "@/components/sections/GaleriaFotos";

function Placeholders() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-line bg-surface"
        >
          <Camera className="text-line" size={36} />
        </div>
      ))}
    </>
  );
}

async function Galeria() {
  await connection();

  let fotos: string[] = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("portfolio_fotos")
      .select("caminho")
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(MAX_FOTOS_PORTFOLIO);

    fotos = (data ?? []).map((f: { caminho: string }) => urlFotoPortfolio(f.caminho));
  } catch {
    fotos = [];
  }

  if (fotos.length === 0) return <Placeholders />;

  return <GaleriaFotos fotos={fotos} />;
}

export default function Portfolio() {
  return (
    <section id="portfolio" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Portfólio</p>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl">
            Alguns dos nossos trabalhos
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          <Suspense fallback={<Placeholders />}>
            <Galeria />
          </Suspense>
        </div>
      </div>
    </section>
  );
}