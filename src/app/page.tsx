"use client"


import type { NextPage } from "next";
import Head from "next/head";
import AuthCard from "../components/Auth/AuthCard";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import Dashboard from "../components/DashBoard/Dashboard";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const Home: NextPage = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => setSession(session));
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <>
      <Head>
        <title>LeadSwift - AI-Powered Global Client Acquisition</title>
        <meta name="description" content="Start closing deals faster with AI-powered lead generation and personalized outreach" />
      </Head>
      <main className="min-h-screen bg-background">
        {!session?.user ? <AuthCard /> : <Dashboard user={session.user} />}
      </main>
    </>
  );
};

export default Home;
