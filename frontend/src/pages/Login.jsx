import { useState } from "react";
import { loginUser, startPasskeyLogin, verifyPasskeyLogin, forgotPassword } from "../api/auth";
import { startAuthentication } from "@simplewebauthn/browser";
import { Fingerprint, Mail, Lock, ArrowRight, KeyRound } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isForgotMode, setIsForgotMode] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await loginUser({ email, password });
      if (res.token) {
          localStorage.setItem("token", res.token);
          navigate("/dashboard");
      } else {
          setError(res.error || res.detail || "Invalid credentials");
      }
    } catch(err) {
      setError("Server error during login.");
    }
  };

  const handlePasskeyLogin = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email first to use Passkey.");
      return;
    }
    try {
      const options = await startPasskeyLogin(email);
      
      // Check if backend returned an explicit error (like "No passkey found")
      if (options.detail || options.error) {
          const errMessage = options.detail || options.error;
          if (errMessage === "No passkey found") {
              setError("No passkey linked to this email. Please sign in with your password and enable it in your Dashboard.");
          } else {
              setError(errMessage);
          }
          return;
      }

      const credential = await startAuthentication({ optionsJSON: options });
      const res = await verifyPasskeyLogin(email, credential);
      
      if (res.token) {
          localStorage.setItem("token", res.token);
          navigate("/dashboard");
      } else {
          setError(res.error || res.detail || "Passkey login failed.");
      }
    } catch (e) {
      console.error(e);
      setError("Passkey login cancelled or failed.");
    }
  };

  const handleForgotPassword = async (e) => {
      e.preventDefault();
      setError("");
      setMessage("");
      if (!email) {
          setError("Please enter your email to recover your account.");
          return;
      }
      try {
          const res = await forgotPassword(email, window.location.origin);
          setMessage(res.message || "Magic link sent to your email!");
      } catch (err) {
          setError("Failed to send recovery email.");
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in relative overflow-hidden">
        {/* Glow orb decorator */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            {isForgotMode ? <KeyRound className="text-white w-8 h-8" /> : <Fingerprint className="text-white w-8 h-8" />}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {isForgotMode ? "Recover Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400 text-sm">
            {isForgotMode ? "Enter your email to receive a magic link" : "Secure access to AI X-Ray Analyzer"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
            {message}
          </div>
        )}

        {!isForgotMode ? (
          <>
            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              className="input-field pl-12" 
              placeholder="Email address" 
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              className="input-field pl-12" 
              placeholder="Password" 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

              <button type="submit" className="btn-primary mt-2">
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </form>
    
            <div className="text-center mt-4 text-sm relative z-10">
                <button type="button" onClick={() => setIsForgotMode(true)} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Forgot password or passkey?
                </button>
            </div>
    
            <div className="my-8 relative flex items-center justify-center z-10">
              <div className="border-t border-white/10 w-full absolute"></div>
              <span className="bg-[#13141c] px-4 text-xs text-gray-500 relative uppercase font-semibold">Or continue with</span>
            </div>
    
            <button onClick={handlePasskeyLogin} className="btn-secondary z-10 relative">
              <Fingerprint className="w-5 h-5" />
              Sign In with Passkey
            </button>
          </>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-5 relative z-10 animate-fade-in">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  className="input-field pl-12" 
                  placeholder="Enter your email address" 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
              <button type="submit" className="btn-primary mt-4">
                Send Magic Link
              </button>
              
              <div className="text-center mt-4 text-sm">
                  <button type="button" onClick={() => setIsForgotMode(false)} className="text-gray-400 hover:text-white transition-colors">
                      Back to Sign in
                  </button>
              </div>
          </form>
        )}

        <p className="text-center mt-8 text-sm text-gray-400">
          Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}