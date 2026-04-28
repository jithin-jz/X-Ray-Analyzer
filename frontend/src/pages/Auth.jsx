import { useState, useEffect } from "react";
import { loginUser, startPasskeyLogin, verifyPasskeyLogin, forgotPassword, registerUser, verifyOtp, startPasskeyRegister, verifyPasskeyRegister } from "../api/auth";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import {
  Fingerprint, Mail, Lock, ArrowRight,
  ShieldCheck, UserPlus, Zap, Database, Activity,
  ChevronLeft
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  // View state
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Global states
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [regStep, setRegStep] = useState('register'); // 'register', 'otp', 'passkey_prompt'

  // Multi-tenant states
  const [role, setRole] = useState("doctor");
  const [hospitalName, setHospitalName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLoginMode(false);
    } else {
      setIsLoginMode(true);
    }
    setError("");
    setMessage("");
  }, [location.pathname]);

  const toggleAuth = () => {
    setError("");
    setMessage("");
    if (isLoginMode) {
      navigate("/register");
    } else {
      navigate("/login");
    }
  };

  // --- Login Logic ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("has_passkey", res.has_passkey ? "true" : "false");
        navigate("/dashboard");
      } else {
        setError(res.error || res.detail || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error during login.");
    } finally {
      setIsLoading(false);
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
      if (options.detail || options.error) {
        setError(options.detail || options.error);
        return;
      }
      const credential = await startAuthentication({ optionsJSON: options });
      const res = await verifyPasskeyLogin(email, credential);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("has_passkey", "true");
        navigate("/dashboard");
      } else {
        setError(res.error || res.detail || "Passkey login failed.");
      }
    } catch (e) {
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

  // --- Register Logic ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const payload = { email, password, role };
      if (role === 'hospital') payload.hospital_name = hospitalName;
      if (role === 'doctor') payload.invite_code = inviteCode;

      const res = await registerUser(payload);
      if (res.message && res.message.includes("OTP sent")) {
        setRegStep('otp');
      } else {
        setError(res.detail || res.error || "Registration error occurred");
      }
    } catch (err) {
      setError("Server error during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await verifyOtp(email, otp);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("has_passkey", res.has_passkey ? "true" : "false");
        setRegStep('passkey_prompt');
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
      setError("Error setting up passkey. You can set it up later.");
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side: Professional Overview */}
      <div className="auth-left">
        <div className="max-w-xl mx-auto">
          <div className="mb-10">
            <h1 className="text-5xl font-bold mb-4 tracking-tight text-gray-900 leading-[1.1]">
              X-Ray <span className="text-blue-600">AI Analyzer</span> <br />
              Intelligence Platform.
            </h1>
            <p className="text-lg text-gray-400 font-light">
              Secure radiological diagnostic support powered by advanced neural imaging analysis.
            </p>
          </div>
        </div>
      </div>




      {/* Right Side: Auth Form Container */}
      <div className="auth-right">
        <div className="auth-card-container fade-slide-in" key={isLoginMode ? 'login' : 'register'}>
          {isLoginMode ? (
            <div className="h-full flex flex-col pt-4">
              <div className="mb-10">
                <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
                  {isForgotMode ? "Reset Password" : "Sign In"}
                </h2>
              </div>






              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
              {message && (
                <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-100 text-green-600 text-sm text-center">
                  {message}
                </div>
              )}

              {isForgotMode ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="input-group">
                    <Mail className="icon w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    <input className="input-field" placeholder="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>


                  <button type="submit" className="btn-primary mt-2">Send Recovery Link</button>
                  <button type="button" onClick={() => setIsForgotMode(false)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">Back to sign in</button>
                </form>
              ) : (
                <>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="input-group">
                      <Mail className="icon w-4 h-4 text-gray-400" strokeWidth={1.5} />
                      <input className="input-field" placeholder="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="input-group">
                      <Lock className="icon w-4 h-4 text-gray-400" strokeWidth={1.5} />
                      <input className="input-field" placeholder="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>


                    <div className="text-right">
                      <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs text-blue-600 hover:underline">Forgot password?</button>
                    </div>
                    <button type="submit" className="btn-primary mt-2" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                  </form>
                  <div className="my-6 relative flex items-center justify-center">
                    <div className="border-t border-gray-100 w-full absolute"></div>
                    <span className="bg-white px-4 text-[10px] text-gray-400 uppercase font-bold tracking-widest relative">Secure Method</span>
                  </div>

                  <button onClick={handlePasskeyLogin} className="btn-secondary">
                    <Fingerprint className="w-4 h-4" strokeWidth={1.5} />
                    Login with Biometrics
                  </button>

                </>
              )}

              <div className="mt-4 text-center pt-3 border-t border-gray-50">
                <p className="text-gray-500 text-xs">
                  New member? <button onClick={toggleAuth} className="text-blue-600 font-semibold hover:underline">Create an account</button>
                </p>
              </div>


            </div>
          ) : (
            <div className="h-full flex flex-col pt-4">
              <div className="mb-10">
                <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Sign Up</h2>
              </div>






              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              {regStep === 'register' ? (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="flex gap-2 mb-4">
                     <button type="button" onClick={() => setRole('doctor')} className={`flex-1 py-2 text-sm rounded transition-colors ${role === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Doctor</button>
                     <button type="button" onClick={() => setRole('hospital')} className={`flex-1 py-2 text-sm rounded transition-colors ${role === 'hospital' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Hospital Admin</button>
                  </div>

                  {role === 'hospital' && (
                    <div className="input-group">
                      <Database className="icon w-4 h-4 text-gray-400" strokeWidth={1.5} />
                      <input className="input-field pl-10" placeholder="Hospital Name" type="text" required value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
                    </div>
                  )}

                  {role === 'doctor' && (
                    <div className="input-group">
                      <Zap className="icon w-4 h-4 text-gray-400" strokeWidth={1.5} />
                      <input className="input-field pl-10" placeholder="Hospital Invite Code" type="text" required value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
                    </div>
                  )}

                  <div className="input-group">
                    <Mail className="icon w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    <input className="input-field pl-10" placeholder="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <Lock className="icon w-4 h-4 text-gray-400" strokeWidth={1.5} />
                    <input className="input-field" placeholder="Create Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>


                  <button type="submit" className="btn-primary mt-2" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Register Account"}
                  </button>
                </form>
              ) : regStep === 'otp' ? (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center text-sm text-gray-500 mb-2">Check your email for the verification code.</div>
                  <input className="input-field text-center text-2xl tracking-[0.5rem] font-mono" placeholder="000000" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value)} />
                  <button type="submit" className="btn-primary">Verify Identity</button>
                  <button onClick={() => setRegStep('register')} className="w-full text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2">
                    <ChevronLeft className="w-3 h-3" /> Change details
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
                    <ShieldCheck className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Verify Biometrics</h3>
                    <p className="text-sm text-gray-500">Enable Passkey for future passwordless sessions.</p>
                  </div>
                  <button onClick={handleRegisterPasskey} className="btn-primary"><Fingerprint className="w-4 h-4" /> Setup Biometrics</button>
                  <button onClick={() => navigate("/dashboard")} className="btn-secondary">Skip for now</button>
                </div>
              )}

              <div className="mt-8 text-center pt-4 border-t border-gray-50">
                <p className="text-gray-500 text-xs">
                  Already a member? <button onClick={toggleAuth} className="text-blue-600 font-semibold hover:underline">Sign in instead</button>
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
