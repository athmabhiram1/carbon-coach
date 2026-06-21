import { useState, useEffect } from "react";
import { createClient } from "../supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "../supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [anonymousId, setAnonymousId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("Profile fetch exception:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Check for anonymous_id in localStorage, ensure server middleware can read it via cookie
    let anonId = localStorage.getItem("carbon-coach-anonymous-id") || "";
    if (anonId) {
      setAnonymousId(anonId);
      document.cookie = `carbon-coach-anonymous-id=${anonId}; path=/; max-age=31536000; SameSite=Lax`;
    }

    // Load initial user state
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }

      if (event === "SIGNED_OUT") {
        let currentAnon = localStorage.getItem("carbon-coach-anonymous-id") || "";
        if (!currentAnon) {
          currentAnon = crypto.randomUUID();
          localStorage.setItem("carbon-coach-anonymous-id", currentAnon);
        }
        setAnonymousId(currentAnon);
        document.cookie = `carbon-coach-anonymous-id=${currentAnon}; path=/; max-age=31536000; SameSite=Lax`;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOAuth = async (provider: "google" | "github") => {
    const supabase = createClient();
    const currentAnon = localStorage.getItem("carbon-coach-anonymous-id") || "";
    const callbackUrl = new URL(`${window.location.origin}/api/auth/callback`);
    if (currentAnon) {
      callbackUrl.searchParams.set("anonymous_id", currentAnon);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const isAnonymous = !user && !!anonymousId;

  return {
    user,
    profile,
    anonymousId,
    isLoading,
    isAnonymous,
    signInWithOAuth,
    signOut,
  };
}
