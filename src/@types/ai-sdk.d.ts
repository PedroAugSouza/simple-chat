// types/ai-sdk.d.ts
import "ai";

declare module "ai" {
  interface Message {
    reasoning?: string;
  }
}
