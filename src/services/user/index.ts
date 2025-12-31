import { toast } from "sonner";
import { DefaultResponse } from "../types";
import { InputLoginUser, InputRegisterUser, OutputLoginUser } from "./contact";
import { setCookie } from "cookies-next";
import { redirect } from "next/navigation";

export const userService = {
  register: async (input: InputRegisterUser): Promise<{ success: boolean }> => {
    const request = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const response = await request.json();
    if (!response.success) {
      toast.error(response.error);
      return { success: false };
    }

    setCookie("token", response.data.token);

    if (response.success) {
      return { success: true };
    }
    toast.error(response.error);
    return { success: false };
  },
  login: async (input: InputLoginUser): Promise<{ success: boolean }> => {
    const request = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const response = await request.json();
    if (!response.success) {
      toast.error(response.error);
      return { success: false };
    }

    setCookie("token", response.data.token);

    if (response.success) {
      return { success: true };
    }
    toast.error(response.error);
    return { success: false };
  },
};
