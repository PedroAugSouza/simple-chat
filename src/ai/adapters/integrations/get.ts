import { prisma } from "@/lib/prisma";
import { getSessionServer } from "@/utils/get-session.server";

export const integrations = async (
  provider: string //"github"
): Promise<{ credentials: Record<string, string> }> => {
  const user = await getSessionServer();

  const integration = await prisma.integration.findFirst({
    where: {
      userId: user.id,
      provider,
    },
  });

  return {
    credentials: JSON.parse(integration?.credentials ?? ""),
  };
};
