import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BotaoWhatsApp from "@/components/layout/BotaoWhatsApp";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <BotaoWhatsApp />
    </>
  );
}