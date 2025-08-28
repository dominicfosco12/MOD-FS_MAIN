import { createClient } from "@supabase/supabase-js";

const supabase =
  globalThis.__supabase__ ||
  (globalThis.__supabase__ = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  ));

export default supabase;
