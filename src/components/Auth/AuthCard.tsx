import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { FaGoogle, FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";

export default function AuthCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ 
          email: email.trim().toLowerCase(), 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) throw error;
        
        if (data.user && !data.session) {
          setSuccess("Check your email for the confirmation link!");
          setShowResendConfirmation(true);
        } else {
          setSuccess("Account created successfully!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: email.trim().toLowerCase(), 
          password 
        });
        if (error) throw error;
        setSuccess("Signed in successfully!");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
        setShowResendConfirmation(true);
      } else if (error.message?.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (error.message?.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  const resendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResendLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      setSuccess('Confirmation email sent! Check your inbox and spam folder.');
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      setError(error.message || 'Failed to resend confirmation email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccess(null);
    setPassword('');
    setShowResendConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-purple-500/25">
              <span className="text-white text-3xl">⚡</span>
            </div>
            <h1 className="text-5xl font-bold text-white">
              LeadSwift
            </h1>
          </div>
          <p className="text-gray-300 text-xl font-medium">
            🌍 AI-Powered Global Client Acquisition
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl p-8 hover:shadow-purple-500/10 transition-all duration-300">
          <div className="space-y-6">
            {/* Google Sign-In */}
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center px-6 py-4 bg-white border border-gray-300 rounded-xl shadow-lg text-lg font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <FaGoogle className="w-6 h-6 mr-3 text-red-500" />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800/50 text-gray-300 font-medium">Or continue with email</span>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✅</span>
                  {success}
                </div>
              </div>
            )}

            {/* Resend Confirmation Button */}
            {showResendConfirmation && (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Didn't receive the email? Check your spam folder or
                </p>
                <button
                  onClick={resendConfirmation}
                  disabled={resendLoading}
                  className="text-purple-400 hover:text-purple-300 underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Sending...' : 'Resend confirmation email'}
                </button>
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                <FaExclamationTriangle className="text-red-400 text-lg flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Email/Password Form */}
            <div className="space-y-5">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your email"
                className="w-full px-6 py-4 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white placeholder-gray-400 text-lg"
                disabled={loading}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                  className="w-full px-6 py-4 pr-14 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-white placeholder-gray-400 text-lg"
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <FaEye className="w-6 h-6" />
                  ) : (
                    <FaEyeSlash className="w-6 h-6" />
                  )}
                </button>
              </div>

              <button
                onClick={handleAuth}
                disabled={loading || !email || !password || password.length < 6}
                className="w-full py-4 px-6 bg-gradient-primary text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                {loading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                  </div>
                ) : (
                  <span className="relative z-10">{isSignUp ? "🚀 Create Account" : "✨ Sign In"}</span>
                )}
              </button>
            </div>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <button
                onClick={handleToggleMode}
                disabled={loading}
                className="text-sm text-gray-300 hover:text-white hover:underline transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="text-center text-sm text-gray-400 font-medium mt-8">
          🔒 By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
