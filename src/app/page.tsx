"use client"

import type { NextPage } from "next";
import Head from "next/head";
import AuthCard from "../components/Auth/AuthCard";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";
import Dashboard from "../components/DashBoard/Dashboard";
import { SettingsProvider } from "../contexts/SettingsContext";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const Home: NextPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setError(null);
        // Get initial session with error handling
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError('Failed to load authentication session');
        } else if (mounted) {
          setSession(session);
        }
      } catch (err) {
        console.error('Unexpected error during auth initialization:', err);
        setError('Authentication system error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (mounted) {
          setSession(session);
          setError(null);
          
          // Handle specific auth events
          if (event === 'SIGNED_OUT') {
            // Clear any cached data on sign out
            localStorage.removeItem('leadswift-cache');
            sessionStorage.clear();
          }
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }
          
          if (event === 'SIGNED_IN') {
            console.log('User signed in:', session?.user?.email);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-purple-500/25">
            <span className="text-white text-3xl">⚡</span>
          </div>
          <div className="text-white text-xl font-semibold mb-2">LeadSwift</div>
          <div className="text-gray-300">Loading...</div>
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">⚠️</span>
          </div>
          <div className="text-white text-xl font-semibold mb-2">Authentication Error</div>
          <div className="text-gray-300 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>LeadSwift - AI-Powered Global Client Acquisition</title>
        <meta name="description" content="Start closing deals faster with AI-powered lead generation and personalized outreach" />
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {!session?.user ? (
          <AuthCard />
        ) : (
          <SettingsProvider user={session.user}>
            <Dashboard user={session.user} />
          </SettingsProvider>
        )}
      </main>
    </>
  );
};

export default Home;
