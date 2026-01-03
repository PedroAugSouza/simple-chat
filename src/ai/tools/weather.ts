import { tool } from "ai";
import z from "zod";

export const weather = tool({
  description:
    "Serve para retornar a temperatura de um local, cidade, municipio ou estado",
  inputSchema: z.object({
    location: z
      .string()
      .describe(
        "Este input é o nome de algum lugar onde o usuário quer saber a temperatura."
      ),
  }),
  inputExamples: [
    { input: { location: "São Francisco" } },
    { input: { location: "Londres" } },
    { input: { location: "Barueri" } },
  ],
  execute: async ({ location }) => {
    const request = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=0d77e335f37cee4f874777d67247c9b3`
    );
    const data = await request.json();

    return {
      temperature: data.main.temp - 273.15,
      humidity: data.main.humidity,
      name: data.name,
    };
  },
});
