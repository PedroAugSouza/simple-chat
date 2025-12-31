import { sign } from "jsonwebtoken";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as RegisterBody;

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: "Dados inválidos", success: false });
    }

    const alreadyUser = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (alreadyUser) {
      return NextResponse.json({
        error: "Usuário já existe",
        success: false,
      });
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: await hash(body.password, 10),
        settings: {
          create: {
            id: crypto.randomUUID(),
          },
        },
      },
    });

    const accessToken = sign(
      { id: user.id, username: user.name, email: user.email, type: "access" },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    const sessionToken = sign(
      { id: user.id, username: user.name, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    return new NextResponse(
      JSON.stringify({ success: true, data: { token: sessionToken } }),
      {
        status: 200,
        headers: {
          "Set-Cookie": `auth_token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false });
  }
};
