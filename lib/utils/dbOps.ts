import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { getDoctorByClerkUser } from "@/lib/supabase/helpers";

export async function getCurrentDoctor() {
  const user = await currentUser();
  if (!user) return null;
  return getDoctorByClerkUser(user);
}
