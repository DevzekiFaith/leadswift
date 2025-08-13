import type { NextPage } from "next";
import Head from "next/head";
import AuthCard from "../components/Auth/AuthCard";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import Dashboard from "../components/DashBoard/Dashboard";

const Home: NextPage = () => {
  const [session, setSession] = useState(supabase.auth.session());

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener?.unsubscribe();
  }, []);

  return (
    <>
      <Head>
        <title>LeadSwift</title>
      </Head>
      <main>
        {!session?.user ? <AuthCard /> : <Dashboard user={session.user} />}
      </main>
    </>
  );
};

export default Home;
