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

const registerSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(8),
});

type Form = z.infer<typeof registerSchema>;

export function RegisterModule() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(registerSchema),
  });
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();

  const registerUser = (data: Form) => {
    startTransition(async () => {
      const response = await userService.register(data);
      if (response.success) {
        push("/chat");
      }
    });
  };

  return (
    <main className="h-screen grid place-items-center bg-zinc-50">
      <Card className="p-6 rounded-xl w-md gap-0 bg-white border-zinc-300">
        <OrbMindLogo className="h-8 w-auto" />
        <CardDescription className="font-normal mt-1">
          Crie sua conta e comece a estudar.
        </CardDescription>
        <form
          className="flex flex-col gap-4 w-full items-start justify-start mt-8"
          onSubmit={handleSubmit(registerUser)}
        >
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Nome</Label>
            <Input placeholder="Insira seu nome." {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Email</Label>
            <Input
              autoComplete="off"
              placeholder="Insira seu email."
              {...register("email")}
              type="email"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Senha</Label>
            <Input
              placeholder="Insira sua senha."
              {...register("password")}
              autoComplete="off"
              type="password"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" type="submit" disabled={isPending}>
            {isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
        <Separator className="mt-4" />

        <p className="text-sm mt-4 text-muted-foreground">
          Já possui conta?{" "}
          <Link href="/login" className="text-foreground font-medium">
            Entre
          </Link>
        </p>
      </Card>
    </main>
  );
}
