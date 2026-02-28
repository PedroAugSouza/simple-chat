"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { userService } from "@/services/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { OrbMindLogo } from "@/components/commom/orbmind-logo";
import z from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type Form = z.infer<typeof loginSchema>;

export function LoginModule() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(loginSchema),
  });
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();

  const loginUser = (data: Form) => {
    startTransition(async () => {
      const response = await userService.login(data);
      if (response.success) {
        push("/chat");
      }
    });
  };

  return (
    <main className="h-screen grid place-items-center leading-relaxed bg-zinc-50">
      <Card className="p-6 rounded-xl w-md gap-0 bg-white border-zinc-300">
        <OrbMindLogo className="h-8 w-auto" />
        <CardDescription className="font-medium font-mono mt-1">
          Seu espaço de estudo com IA.
        </CardDescription>
        <form
          className="flex flex-col gap-4 w-full items-start justify-start mt-8"
          onSubmit={handleSubmit(loginUser)}
        >
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Email</Label>
            <Input
              placeholder="Insira seu email."
              type="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Senha</Label>
            <Input
              placeholder="Insira sua senha."
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <Separator className="mt-4" />

        <p className="text-sm mt-4 text-muted-foreground">
          Ainda não possui conta?{" "}
          <Link href="/register" className="text-foreground">
            Cadastre-se
          </Link>
        </p>
      </Card>
    </main>
  );
}
