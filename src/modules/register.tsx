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

const registerSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(8),
});

type Form = z.infer<typeof registerSchema>;

export function RegisterModule() {
  const { register, handleSubmit } = useForm<Form>();
  const { push } = useRouter();

  const registerUser = async (data: Form) => {
    const response = await userService.register(data);
    if (response.success) {
      push("/chat");
    }
  };

  return (
    <main className="h-screen grid place-items-center">
      <Card className="p-6 rounded-xl w-md  gap-0">
        <h1 className="text-foreground font-semibold text-2xl">Simple Chat</h1>
        <CardDescription className="font-normal">
          Seu chat de IA com personalidade de forma simples.
        </CardDescription>
        <form
          className="flex flex-col gap-4 w-full items-start justify-start mt-8"
          onSubmit={handleSubmit(registerUser)}
        >
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Nome</Label>
            <Input placeholder="Insira seu nome." {...register("name")} />
          </div>
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Email</Label>
            <Input
              autoComplete="off"
              placeholder="Insira seu email."
              {...register("email")}
              type="email"
            />
          </div>
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Senha</Label>
            <Input
              placeholder="Insira sua senha."
              {...register("password")}
              autoComplete="off"
              type="password"
            />
          </div>
          <Button className="w-full" type="submit">
            Cadastrar
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
