export const SITE = {
  nome: "Eu & Ela Fotos",
  whatsappNumero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5551995441382",
  whatsappExibicao: "(51) 99544-1382",
  instagramUrl: "https://www.instagram.com/eueela.fotos/",
  instagramUser: "@eueela.fotos",
};

export function whatsappLink(mensagem?: string) {
  const base = `https://wa.me/${SITE.whatsappNumero}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}