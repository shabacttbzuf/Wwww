import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // Supabase publishable keys are API keys, not user access-token JWTs.
    if (
      (supabaseKey.startsWith("sb_publishable_") || supabaseKey.startsWith("sb_secret_")) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseClient() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    (typeof window !== "undefined" ? localStorage.getItem("supabase_url") : null);
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    (typeof window !== "undefined" ? localStorage.getItem("supabase_key") : null);

  if (!url || !key) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("supabase-config-needed"));
    }
    return createClient<Database>(
      "https://placeholder.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder",
      {
        auth: { persistSession: false },
      },
    );
  }

  return createClient<Database>(url, key, {
    global: { fetch: createSupabaseFetch(key) },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let instance: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_target, property, receiver) {
    instance ??= createSupabaseClient();
    return Reflect.get(instance, property, receiver);
  },
});
