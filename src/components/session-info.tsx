import { auth } from "@/lib/auth";

export async function SessionInfo() {
  const session = await auth();

  console.log("Session Info:", session);

  return;
}
