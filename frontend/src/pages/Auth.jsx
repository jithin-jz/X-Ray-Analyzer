import { useState, useEffect } from "react";
import {
  loginUser, startPasskeyLogin, verifyPasskeyLogin, forgotPassword,
  registerUser, verifyOtp, startPasskeyRegister, verifyPasskeyRegister
} from "../api/auth";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, Mail, Lock, Database, Zap, ShieldCheck, ChevronLeft } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [regStep, setRegStep] = useState("register");
  const [role, setRole] = useState("doctor");
  const [hospitalName, setHospitalName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setIsLoginMode(location.pathname !== "/register");
    setError(""); setMessage("");
  }, [location.pathname]);

  const toggleAuth = () => {
    setError(""); setMessage("");
    navigate(isLoginMode ? "/register" : "/login");
  };

  // ── Login ──
  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.access_token) {
        await login(res.access_token, res.refresh_token, res.has_passkey);
        toast.success("Welcome back!"); navigate("/dashboard");
      } else setError(res.detail || "Invalid credentials");
    } catch (err) { setError(err.message || "Login failed"); }
    finally { setIsLoading(false); }
  };

  const handlePasskeyLogin = async () => {
    setError("");
    if (!email) { setError("Enter your email first."); return; }
    try {
      const options = await startPasskeyLogin(email);
      const credential = await startAuthentication({ optionsJSON: options });
      const res = await verifyPasskeyLogin(email, credential);
      if (res.access_token) {
        await login(res.access_token, res.refresh_token, true);
        toast.success("Biometric login successful"); navigate("/dashboard");
      } else setError(res.detail || "Passkey login failed.");
    } catch { setError("Passkey login cancelled or failed."); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault(); setError(""); setMessage("");
    if (!email) { setError("Enter your email."); return; }
    try {
      await forgotPassword(email, window.location.origin);
      toast.success("Recovery link sent!"); setMessage("Check your email for the reset link.");
    } catch { setError("Failed to send recovery email."); }
  };

  // ── Register ──
  const handleRegister = async (e) => {
    e.preventDefault(); setError(""); setIsLoading(true);
    try {
      const payload = { email, password, role };
      if (role === "hospital") payload.hospital_name = hospitalName;
      if (role === "doctor") payload.invite_code = inviteCode;
      const res = await registerUser(payload);
      if (res.message?.includes("OTP")) { toast.success("Code sent!"); setRegStep("otp"); }
      else setError(res.detail || "Registration error");
    } catch (err) { setError(err.message || "Registration failed"); }
    finally { setIsLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); setError("");
    try {
      const res = await verifyOtp(email, otp);
      if (res.access_token) {
        await login(res.access_token, res.refresh_token, res.has_passkey);
        toast.success("Verified!"); setRegStep("passkey_prompt");
      } else setError(res.detail || "Invalid OTP");
    } catch { setError("OTP verification failed."); }
  };

  const handleRegisterPasskey = async () => {
    setError("");
    try {
      const options = await startPasskeyRegister(email);
      const credential = await startRegistration({ optionsJSON: options });
      const res = await verifyPasskeyRegister(email, credential);
      if (res.access_token) {
        await login(res.access_token, res.refresh_token, true);
        toast.success("Passkey registered!"); navigate("/dashboard");
      } else setError(res.detail || "Passkey setup failed");
    } catch {
      toast("Skipped passkey setup.", { icon: "👋" });
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col items-center justify-center px-4 py-6 sm:py-12">
      {/* Logo */}
      <Link to="/" className="mb-5 sm:mb-8 text-[15px] sm:text-lg font-bold text-[var(--ink)] tracking-tight">
        AI X-Ray Analyzer
      </Link>

      {/* Card — on mobile it's borderless full-width, on desktop it's a card */}
      <div className="w-full max-w-[400px] sm:bg-[var(--canvas)] sm:border sm:border-[var(--hairline)] sm:rounded-[32px] sm:p-8 p-0">
        {/* Title */}
        <h2 className="text-[20px] sm:text-[22px] font-semibold text-[var(--ink)] text-center mb-1.5 sm:mb-2">
          {isLoginMode ? (isForgotMode ? "Reset password" : "Welcome back") : "Create account"}
        </h2>
        <p className="text-[13px] sm:text-sm text-[var(--mute)] text-center mb-5 sm:mb-6">
          {isLoginMode
            ? (isForgotMode ? "We'll send a recovery link" : "Sign in to your hospital portal")
            : "Register your hospital or join one"
          }
        </p>

        {/* Errors / Messages */}
        {error && <div className="mb-4 p-3 rounded-[16px] bg-red-50 text-[var(--error)] text-sm text-center">{error}</div>}
        {message && <div className="mb-4 p-3 rounded-[16px] bg-[var(--success-pale)] text-[var(--success)] text-sm text-center">{message}</div>}

        {/* ── LOGIN ── */}
        {isLoginMode && !isForgotMode && (
          <>
            <form onSubmit={handleLogin} className="space-y-3">
              <Input icon={<Mail />} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input icon={<Lock />} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <div className="text-right">
                <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs font-semibold text-[var(--mute)] hover:text-[var(--ink)]">Forgot password?</button>
              </div>
              <PrimaryButton loading={isLoading}>Sign in</PrimaryButton>
            </form>
            <Divider label="or" />
            <SecondaryButton onClick={handlePasskeyLogin} icon={<Fingerprint className="w-4 h-4" />}>
              Sign in with Passkey
            </SecondaryButton>
          </>
        )}

        {/* ── FORGOT ── */}
        {isLoginMode && isForgotMode && (
          <form onSubmit={handleForgotPassword} className="space-y-3">
            <Input icon={<Mail />} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <PrimaryButton>Send recovery link</PrimaryButton>
            <button type="button" onClick={() => setIsForgotMode(false)} className="w-full text-sm text-[var(--mute)] hover:text-[var(--ink)] mt-2">Back to sign in</button>
          </form>
        )}

        {/* ── REGISTER ── */}
        {!isLoginMode && regStep === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="flex gap-2 mb-2">
              <RoleTab active={role === "doctor"} onClick={() => setRole("doctor")}>Doctor</RoleTab>
              <RoleTab active={role === "hospital"} onClick={() => setRole("hospital")}>Hospital Admin</RoleTab>
            </div>
            {role === "hospital" && <Input icon={<Database />} placeholder="Hospital name" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />}
            {role === "doctor" && <Input icon={<Zap />} placeholder="Invite code" value={inviteCode} onChange={e => setInviteCode(e.target.value)} />}
            <Input icon={<Mail />} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input icon={<Lock />} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <PrimaryButton loading={isLoading}>Create account</PrimaryButton>
          </form>
        )}

        {!isLoginMode && regStep === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-[var(--mute)] text-center">Enter the 6-digit code sent to your email.</p>
            <input
              className="w-full text-center text-2xl tracking-[0.4em] font-mono bg-[var(--surface-card)] border border-[var(--hairline)] rounded-[16px] px-4 py-3 focus:outline-none focus:border-[var(--ink)]"
              placeholder="000000" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)}
            />
            <PrimaryButton>Verify</PrimaryButton>
            <button type="button" onClick={() => setRegStep("register")} className="w-full text-sm text-[var(--mute)] hover:text-[var(--ink)] flex items-center justify-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
          </form>
        )}

        {!isLoginMode && regStep === "passkey_prompt" && (
          <div className="text-center space-y-4">
            <div className="p-5 bg-[var(--surface-card)] rounded-[16px]">
              <ShieldCheck className="w-8 h-8 text-[var(--ink)] mx-auto mb-2" />
              <h3 className="text-base font-semibold text-[var(--ink)] mb-1">Set up Passkey</h3>
              <p className="text-sm text-[var(--mute)]">Enable biometric login for faster, passwordless access.</p>
            </div>
            <PrimaryButton onClick={handleRegisterPasskey} icon={<Fingerprint className="w-4 h-4" />}>Setup Passkey</PrimaryButton>
            <SecondaryButton onClick={() => navigate("/dashboard")}>Skip for now</SecondaryButton>
          </div>
        )}

        {/* Toggle */}
        <div className="mt-6 text-center">
          <span className="text-sm text-[var(--mute)]">
            {isLoginMode ? "New here? " : "Already a member? "}
            <button onClick={toggleAuth} className="font-semibold text-[var(--ink)] hover:underline">
              {isLoginMode ? "Create account" : "Sign in"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Reusable sub-components ──

function Input({ icon, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ash)] w-4 h-4">
        {icon}
      </span>
      <input
        {...props}
        required
        className="w-full bg-[var(--surface-card)] border border-[var(--hairline)] text-[var(--ink)] text-sm rounded-[16px] pl-10 pr-4 py-3 placeholder:text-[var(--ash)] focus:outline-none focus:border-[var(--ink)] transition-colors"
      />
    </div>
  );
}

function PrimaryButton({ children, loading, icon, onClick, type = "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[var(--on-primary)] bg-[var(--primary)] rounded-[16px] hover:bg-[var(--primary-pressed)] disabled:opacity-60 transition-colors"
    >
      {icon}{loading ? "Loading..." : children}
    </button>
  );
}

function SecondaryButton({ children, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[var(--ink)] bg-[var(--secondary-bg)] rounded-[16px] hover:bg-[var(--secondary-pressed)] transition-colors"
    >
      {icon}{children}
    </button>
  );
}

function RoleTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-bold rounded-[9999px] transition-colors ${
        active ? "bg-[var(--ink)] text-[var(--on-primary)]" : "bg-[var(--surface-card)] text-[var(--mute)] hover:bg-[var(--secondary-bg)]"
      }`}
    >
      {children}
    </button>
  );
}

function Divider({ label }) {
  return (
    <div className="relative flex items-center justify-center my-5">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--hairline)]" /></div>
      <span className="relative bg-[var(--canvas)] px-3 text-xs text-[var(--ash)] uppercase font-bold tracking-wider">{label}</span>
    </div>
  );
}
