import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não definidas no .env.local"
  );
}

export const supabase = createBrowserClient(url, key);

export type StatusAgendamento = "pendente" | "confirmado" | "concluido";

export type Agendamento = {
  id: string;
  nome_cliente: string;
  telefone_cliente: string;
  tipo_evento: string;
  pacote_escolhido: string;
  data_evento: string; // "YYYY-MM-DD"
  horario_evento: string; // "HH:MM:SS"
  local_evento: string;
  taxa_deslocamento: number;
  valor_total: number;
  status: StatusAgendamento;
  created_at: string;
};

export type FotoPortfolio = {
  id: string;
  caminho: string;
  ordem: number;
  created_at: string;
};