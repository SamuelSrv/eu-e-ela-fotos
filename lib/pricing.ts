export type Categoria = "padrao" | "esportivo";
export type Regiao = "guaiba" | "porto-alegre" | "metropolitana";

export type Pacote = {
  id: string;
  categoria: Categoria;
  nome: string;
  preco: number;
};

export type ConfigPrecos = {
  formaturaLimite: number;
  formaturaPrecoAte: number;
  formaturaPrecoAcima: number;
  taxas: Record<Regiao, number>;
};

export type Precos = { pacotes: Pacote[]; config: ConfigPrecos };

export const TIPOS_EVENTO = [
  { value: "Ensaio", label: "Ensaio (pacotes padrão)" },
  { value: "Esportivo", label: "Esportivo" },
  { value: "Formatura", label: "Formatura" },
] as const;

export const REGIOES_LABEL: Record<Regiao, string> = {
  guaiba: "Guaíba",
  "porto-alegre": "Porto Alegre",
  metropolitana: "Região Metropolitana",
};

export const ENTRADA_PERCENTUAL = 50;
export const ENTREGA = { prazoDiasUteis: 10, validadeLinkDias: 60 };

// Valores de reserva, usados se o banco estiver indisponível
export const PRECOS_PADRAO: Precos = {
  pacotes: [
    { id: "padrao-1h", categoria: "padrao", nome: "1 hora", preco: 130 },
    { id: "padrao-3h", categoria: "padrao", nome: "3 horas", preco: 350 },
    { id: "padrao-4h", categoria: "padrao", nome: "4 horas", preco: 470 },
    { id: "padrao-5h", categoria: "padrao", nome: "5 horas ou mais", preco: 630 },
    { id: "esportivo-1h", categoria: "esportivo", nome: "1 hora", preco: 130 },
    { id: "esportivo-2h", categoria: "esportivo", nome: "2 horas", preco: 230 },
  ],
  config: {
    formaturaLimite: 20,
    formaturaPrecoAte: 100,
    formaturaPrecoAcima: 80,
    taxas: { guaiba: 0, "porto-alegre": 100, metropolitana: 150 },
  },
};

export function brl(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function pacotesPorTipo(precos: Precos, tipo: string): Pacote[] {
  const categoria: Categoria | null =
    tipo === "Ensaio" ? "padrao" : tipo === "Esportivo" ? "esportivo" : null;
  return categoria ? precos.pacotes.filter((p) => p.categoria === categoria) : [];
}

type EntradaCalculo = {
  tipo: string;
  pacote: string;
  formandos: string;
  regiao: string;
};

export function calcularPedido(
  precos: Precos,
  { tipo, pacote, formandos, regiao }: EntradaCalculo
) {
  const { config } = precos;
  let descricaoPacote: string | null = null;
  let valorPacote: number | null = null;

  if (tipo === "Formatura") {
    const n = Number(formandos);
    if (Number.isInteger(n) && n >= 1) {
      const unit =
        n > config.formaturaLimite ? config.formaturaPrecoAcima : config.formaturaPrecoAte;
      valorPacote = n * unit;
      descricaoPacote = `Formatura: ${n} ${n === 1 ? "formando" : "formandos"} (${brl(unit)} cada)`;
    }
  } else {
    const escolhido = pacotesPorTipo(precos, tipo).find((p) => p.id === pacote);
    if (escolhido) {
      valorPacote = escolhido.preco;
      descricaoPacote = `${tipo === "Esportivo" ? "Esportivo" : "Padrão"}: ${escolhido.nome}`;
    }
  }

  const taxa = regiao in config.taxas ? config.taxas[regiao as Regiao] : null;
  const total = valorPacote !== null && taxa !== null ? valorPacote + taxa : null;
  const entrada = total !== null ? Math.round(total * ENTRADA_PERCENTUAL) / 100 : null;

  return { descricaoPacote, valorPacote, taxa, total, entrada };
}