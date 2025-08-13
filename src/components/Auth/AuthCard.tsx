import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthCard() {
  const [email, setEmail] = useState("");

  const signIn = async () => {
    const { error } = await supabase.auth.signIn({ email }, { redirectTo: window.location.origin });
    if (error) alert(error.message);
    else alert("Check your email for a login link.");
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-2">Welcome to LeadSwift</h2>
      <p className="text-sm text-gray-600 mb-4">Enter your email — magic link will be sent to sign in.</p>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="w-full p-3 border rounded mb-3"
      />
      <button onClick={signIn} className="w-full py-3 rounded bg-gradient-to-r from-primary to-accent text-white font-semibold">
        Send Magic Link
      </button>
    </div>
  );
}
