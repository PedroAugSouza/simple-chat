"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { userService } from "@/services/user";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
const loginSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(8),
});

type Form = z.infer<typeof loginSchema>;
export function LoginModule() {
  const { register, handleSubmit } = useForm<Form>();
  const { push } = useRouter();

  const loginUser = async (data: Form) => {
    const response = await userService.login(data);
    if (response.success) {
      push("/chat");
    }
  };
  return (
    <main className="h-screen grid place-items-center leading-relaxed ">
      <Card className="p-6 rounded w-md  gap-0">
        <p className="text-2xl font-bold tracking-tighter flex items-center gap-1">
          Simpl<span className="w-2 h-2 bg-black rounded-full mt-2"></span>
        </p>
        <CardDescription className="font-medium font-mono">
          Seu chat de IA com personalidade de forma simples.
        </CardDescription>
        <form
          className="flex flex-col gap-4 w-full items-start justify-start mt-8"
          onSubmit={handleSubmit(loginUser)}
        >
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Email</Label>
            <Input
              placeholder="Insira seu email."
              className="rounded-none"
              type="email"
              {...register("email")}
            />
          </div>
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Senha</Label>
            <Input
              placeholder="Insira sua senha."
              type="password"
              className="rounded-none"
              {...register("password")}
            />
          </div>
          <Button className="w-full rounded-none">Entrar</Button>
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
