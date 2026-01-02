"use client";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

export interface TokenPayload {
  id: string;
  username: string;
  email: string;
}

export const getSession = (): TokenPayload | null => {
  const rawToken = getCookie("token");
  const token = typeof rawToken === "string" ? rawToken : rawToken?.toString();

  if (!token || token.split(".").length < 3) {
    return null;
  }

  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
};
