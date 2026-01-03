"use client";
import { OutputGetPlatforms } from "@/services/integrations/contract";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { PlatformIcon } from "./platform-icon";
import { Switch } from "../ui/switch";
import { integrationService } from "@/services/integrations";
import { toast } from "sonner";
import { mutate } from "swr";
import Link from "next/link";

export const Platform = (platform: OutputGetPlatforms) => {
  return (
    <Card className="p-3 gap-2 w-xs mt-3 rounded-xl">
      <header className="flex items-center gap-2">
        <div className="p-1 border border-muted-foreground rounded">
          <PlatformIcon name={platform.icon} />
        </div>
        <CardTitle>{platform.name}</CardTitle>
      </header>

      <CardDescription>{platform.description}</CardDescription>
      <footer className="flex items-center justify-between w-full pt-3 border-t cursor-pointer">
        <Switch
          className="rounded *:rounded cursor-pointer"
          disabled={!platform.authorized}
          checked={platform.active}
          onCheckedChange={(value) =>
            integrationService
              .update(platform.integrationId!, {
                active: value,
              })
              .then(() => {
                toast.success("Integração atualizada com sucesso!");
                mutate("platforms");
              })
          }
        />
        <Link
          href={platform.oauthLink}
          className="rounded-lg bg-foreground py-1.5 px-3 text-background leading-relaxed text-sm"
        >
          {platform.authorized ? "Autorizado" : "Autorizar"}
        </Link>
      </footer>
    </Card>
  );
};
