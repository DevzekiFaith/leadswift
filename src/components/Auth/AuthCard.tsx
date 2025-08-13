import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AuthCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Tagline */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-black text-white mb-2">
            LeadSwift
          </h1>
          <p className="text-2xl font-semibold text-white mb-2">
            Start Closing Deals Faster 🚀
          </p>
          <p className="text-sm text-white">
            AI-powered global client acquisition for ambitious businesses
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Google Sign-In */}
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center px-4 py-3 border border-primary-accent rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-purple-50 transition-colors"
            >
              <FaGoogle className="w-5 h-5 mr-3 text-red-500" />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none transition-all"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <FaEye className="w-5 h-5" />
                  ) : (
                    <FaEyeSlash className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                onClick={handleAuth}
                disabled={loading || !email || !password}
                className="w-full py-3 px-4 bg-gray-600 text-black font-semibold rounded-lg hover:opacity-90 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center text-black">
                    <div className="w-5 h-5 border-2 border-black rounded-full animate-spin mr-2"></div>
                    <span className="text-black">{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                  </div>
                ) : (
                  <span className="text-white">{isSignUp ? "Create Account" : "Sign In"}</span>
                )}
              </button>
            </div>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-white hover:underline hover:text-primary-accent cursor-pointer transition-colors"
              >
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"
                }
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
