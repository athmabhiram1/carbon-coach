import { createClient } from "@/lib/supabase/client";

export function getAuthService() {
  const supabase = createClient();

  return {
    async signOut() {
      return await supabase.auth.signOut();
    },
    async getSession() {
      return await supabase.auth.getSession();
    },
    async getUser() {
      return await supabase.auth.getUser();
    },
  };
}
