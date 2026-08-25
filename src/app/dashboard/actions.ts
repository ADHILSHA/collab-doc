"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CURRENT_USER_COOKIE } from "@/lib/session";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(CURRENT_USER_COOKIE);
  redirect("/login");
}
