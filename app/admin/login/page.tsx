import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";
import { SITE } from "@/lib/constants";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/logo.jpeg"
            alt={`Logo ${SITE.nome}`}
            width={72}
            height={72}
            className="h-18 w-18 rounded-full object-cover ring-1 ring-accent/60"
          />
          <h1 className="mt-5 font-serif text-2xl">Área administrativa</h1>
          <p className="mt-2 text-sm text-muted">Acesso restrito</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}