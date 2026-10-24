export const BUCKET_PORTFOLIO = "portfolio";
export const MAX_FOTOS_PORTFOLIO = 24;

export function urlFotoPortfolio(caminho: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_PORTFOLIO}/${caminho}`;
}