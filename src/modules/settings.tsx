"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AnthropicIcon } from "@/icons";
import { settingsService } from "@/services/settings";
import { InputUpdateSetting } from "@/services/settings/contracts";
import { getSession } from "@/utils/get-session";
import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import colors from "tailwindcss/colors";

export function SettingsModule() {
  const session = getSession();
  const { push } = useRouter();

  const sessionId = session?.id;
  const { data, mutate } = useSWR("settiings", () =>
    settingsService.get(sessionId!)
  );

  const models = [
    "claude-sonnet-4-5",
    "claude-sonnet-4-0",
    "claude-3-7-sonnet-latest",
  ];

  const setSetting = async ({ apiKey, model }: InputUpdateSetting) => {
    if (apiKey === data?.data?.apiKey) return;
    if (model === data?.data?.model) return;

    const result = await settingsService.update(sessionId!, {
      model,
      apiKey,
    });

    if (result.success) {
      toast.success("Configurações salvas com sucesso!");
      mutate();
    }
  };

  return (
    <Card className="flex-1 h-full border  p-2 shadow-none overflow-hidden gap-0 rounded-r-xl">
      <header className="w-full py-2 px-4 bg-gray-50 text-gray-800 font-medium mb-1 ">
        <h1 className="text-sm">Configurações</h1>
      </header>
      <Separator />
      <CardContent className="items-start flex flex-col justify-start">
        <section
          id="profile"
          className="flex items-start justify-start p-4 flex-col "
        >
          <span className="text-sm">
            Logado como: <strong> {session?.username}</strong>
          </span>
          <Button
            size={"sm"}
            className="mt-2 cursor-pointer"
            onClick={() => {
              deleteCookie("token");
              deleteCookie("auth_token");
              push("/login");
            }}
          >
            Logout
          </Button>
        </section>
        <section
          id="models"
          className="flex items-start justify-start p-4 flex-col "
        >
          <h1 className="text-gray-800 font-medium text-lg">Modelo</h1>
          <span className="text-gray-500 text-sm">
            Selecione o modelo desejado, ou se preferir, coloque a sua chave de
            API.
          </span>
          <Card className="w-full flex-row rounded-xl p-2 gap-2 mt-2 relative">
            <div className="w-full flex flex-col">
              <Select
                value={data?.data.model}
                onValueChange={(model) => setSetting({ model })}
              >
                <SelectTrigger className="w-full font-mono">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent className="font-mono">
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator orientation="vertical" />
            <div className="w-full flex-col">
              <div className="flex gap-2">
                <Input
                  placeholder="Chave de api"
                  className="font-mono"
                  defaultValue={data?.data?.apiKey ?? ""}
                  onBlur={async ({ target }) =>
                    await setSetting({ apiKey: target.value })
                  }
                />
                <div className=" grid place-items-center px-2.5 rounded-md bg-black">
                  <AnthropicIcon color={colors.white} width={16} />
                </div>
              </div>
            </div>
          </Card>
          {data?.data?.apiKey && (
            <span className="text-muted-foreground text-xs">
              Agora você está usando sua chave de API.
            </span>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
