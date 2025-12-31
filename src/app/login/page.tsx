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
export default function Login() {
  const { register, handleSubmit } = useForm<Form>();
  const { push } = useRouter();

  const loginUser = async (data: Form) => {
    const response = await userService.login(data);
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
          onSubmit={handleSubmit(loginUser)}
        >
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Email</Label>
            <Input
              placeholder="Insira seu email."
              type="email"
              {...register("email")}
            />
          </div>
          <div className="flex flex-col w-full gap-2 text-foreground">
            <Label>Senha</Label>
            <Input
              placeholder="Insira sua senha."
              type="password"
              {...register("password")}
            />
          </div>
          <Button className="w-full">Entrar</Button>
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
