import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(supabase.auth.session());
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener?.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} session={session} />
    </QueryClientProvider>
  );
}
