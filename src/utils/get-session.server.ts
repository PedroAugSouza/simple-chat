import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
}
export const getSessionServer = async () => {
  const store = await cookies();

  const token = store.get("token")?.value;

  return jwtDecode<TokenPayload>(token!);
};
