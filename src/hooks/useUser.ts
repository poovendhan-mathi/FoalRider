import { getSupabaseServerClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getUser = cache(async () => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getUserProfile = cache(async () => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await getSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
});
