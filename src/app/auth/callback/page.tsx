"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          console.log('Auth callback successful, redirecting to dashboard');
          router.push('/');
        } else {
          console.log('No session found, redirecting to login');
          router.push('/');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        router.push('/?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-lg shadow-purple-500/25">
          <span className="text-white text-3xl">⚡</span>
        </div>
        <div className="text-white text-xl font-semibold mb-2">LeadSwift</div>
        <div className="text-gray-300">Completing authentication...</div>
      </div>
    </div>
  );
}
