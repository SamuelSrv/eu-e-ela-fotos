"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { supabase } from "@/utils/supabase";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

type FormValues = z.infer<typeof schema>;

const inputCls =
  "w-full rounded-lg border border-line bg-surface-2 px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted/60 focus:border-accent";

export default function LoginForm() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", senha: "" },
  });

  async function onSubmit(v: FormValues) {
    setErro(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: v.email,
      password: v.senha,
    });

    if (error) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
      <div>
        <label className="mb-2 block text-sm text-muted">E-mail</label>
        <input
          type="email"
          autoComplete="username"
          className={inputCls}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm text-muted">Senha</label>
        <input
          type="password"
          autoComplete="current-password"
          className={inputCls}
          {...register("senha")}
        />
        {errors.senha && (
          <p className="mt-1.5 text-sm text-red-400">{errors.senha.message}</p>
        )}
      </div>

      {erro && (
        <p className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-3 font-medium text-background transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {isSubmitting && <LoaderCircle size={18} className="animate-spin" />}
        Entrar
      </button>
    </form>
  );
}