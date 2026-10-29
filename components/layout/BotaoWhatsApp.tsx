import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/constants";

const MENSAGEM =
  "Olá! Gostaria de tirar uma dúvida sobre os serviços da Eu & Ela Fotos.";

export default function BotaoWhatsApp() {
  return (
    <a
      href={whatsappLink(MENSAGEM)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Tirar dúvidas pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-accent p-4 text-background shadow-lg shadow-black/40 transition-colors hover:bg-accent-strong sm:px-5 sm:py-3"
    >
      <MessageCircle size={24} />
      <span className="hidden text-sm font-medium sm:inline">Dúvidas? Fale conosco</span>
    </a>
  );
}