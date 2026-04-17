import { useState } from "react";
import { registerUser, verifyOtp, startPasskeyRegister, verifyPasskeyRegister } from "../api/auth";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, Mail, Lock, UserPlus, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  // steps: 'register', 'otp', 'passkey_prompt'
  const [step, setStep] = useState('register');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await registerUser({ email, password });
      if (res.message && res.message.includes("OTP sent")) {
          setStep('otp');
      } else {
          setError(res.detail || res.error || "Registration error occurred");
      }
    } catch(err) {
      setError("Server error during registration.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
        const res = await verifyOtp(email, otp);
        if (res.token) {
            localStorage.setItem("token", res.token);
            setStep('passkey_prompt');
        } else {
            setError(res.detail || res.error || "Invalid OTP code");
        }
    } catch (e) {
        setError("Error verifying OTP.");
    }
  };

  const handleRegisterPasskey = async () => {
    setError("");
    try {
        const options = await startPasskeyRegister(email);
        const credential = await startRegistration({ optionsJSON: options });
        const res = await verifyPasskeyRegister(email, credential);
        
        if (res.token) {
            localStorage.setItem("token", res.token);
            navigate("/dashboard");
        } else {
            setError(res.error || res.detail || "Passkey setup failed");
        }
    } catch (e) {
        console.error(e);
        setError("Error setting up passkey. You can set it up later.");
        setTimeout(() => navigate("/dashboard"), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-8 animate-fade-in relative overflow-hidden">
        {/* Glow orb decorator */}
        <div className="absolute -top-40 -left-20 w-60 h-60 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30">
            {step === 'register' && <UserPlus className="text-white w-8 h-8" />}
            {step === 'otp' && <KeyRound className="text-white w-8 h-8" />}
            {step === 'passkey_prompt' && <ShieldCheck className="text-white w-8 h-8" />}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {step === 'register' && "Create Account"}
            {step === 'otp' && "Verify Email"}
            {step === 'passkey_prompt' && "Access Secured"}
          </h2>
          <p className="text-gray-400 text-sm">
            {step === 'register' && "Join AI X-Ray Analyzer today"}
            {step === 'otp' && "We've sent a 6-digit code to your email"}
            {step === 'passkey_prompt' && "Your account is ready. Boost your security now!"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {step === 'register' && (
          <>
            <form onSubmit={handleRegister} className="space-y-5 relative z-10">
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

              <button type="submit" className="btn-primary mt-4">
                Create Account <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-gray-400 relative z-10">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 relative z-10 animate-fade-in">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  className="input-field pl-12 text-center text-xl tracking-widest font-mono" 
                  placeholder="000 000" 
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)} 
                />
              </div>
              <button type="submit" className="btn-primary mt-4">
                Verify Account
              </button>
          </form>
        )}

        {step === 'passkey_prompt' && (
          <div className="space-y-6 relative z-10 animate-fade-in text-center">
            <p className="text-gray-300">
              You are now logged in! We highly recommend setting up a Passkey (Touch ID, Face ID, or Windows Hello) for faster, passwordless logins in the future.
            </p>
            
            <button onClick={handleRegisterPasskey} className="btn-primary">
              <Fingerprint className="w-5 h-5" /> Let's Setup a Passkey
            </button>
            
            <button onClick={() => navigate("/dashboard")} className="btn-secondary">
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}