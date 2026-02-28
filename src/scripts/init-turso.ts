import { initializeTurso } from "../lib/turso";
import * as dotenv from "dotenv";
import { join } from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: join(process.cwd(), ".env.local") });
dotenv.config({ path: join(process.cwd(), ".env") });

async function main() {
  console.log("🛠️  Iniciando configuração do Turso...");
  try {
    await initializeTurso();
    console.log("🏁 Configuração concluída com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao configurar o Turso:", error);
    process.exit(1);
  }
}

main();
