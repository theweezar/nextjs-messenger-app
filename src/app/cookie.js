"use server";

import { cookies } from "next/headers";

export const getServerUserCookie = async () => {
  let cookieUser = null;
  try {
    const cookieStore = await cookies();
    cookieUser = cookieStore.get("user");
    cookieUser = cookieUser ? JSON.parse(cookieUser.value) : null;
  } catch (error) {
    cookieUser = null;
    console.error("Error parsing user cookie:", error);
  }
  return cookieUser;
};
