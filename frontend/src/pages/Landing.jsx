import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  ShieldCheck,
  Database,
  Zap,
  Brain,
  Users,
  Activity,
  ArrowRight,
  Check,
  Lock,
  Sparkles,
  Stethoscope,
  FileText,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
 * Landing — Pinterest-inspired marketing surface
 * Design tokens: see DESIGN.md
 * - 64px section rhythm (48px tablet, 32px mobile)
 * - Pinterest Red reserved for Sign-up CTA only
 * - 16px radius (md) default, 32px (lg) for feature cards / dark strip
 * - Alternating cream / canvas surfaces
 * ──────────────────────────────────────────────────────── */

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--surface-soft)] flex flex-col">
      <TopNav />

      <main className="flex-1">
        <Hero />
        <TrustBar />
        <FeatureRow
          eyebrow="AI analysis"
          title="Explainable predictions, not a black box"
          copy="Every prediction is paired with a Grad-CAM heatmap showing exactly where the model focused. Doctors verify findings in seconds, not minutes."
          bullets={[
            "Deep learning model trained on 100k+ chest X-rays",
            "Heatmap overlay pinpoints suspected regions",
            "Confidence score with every prediction",
          ]}
          visual={<HeatmapVisual />}
          reverse={false}
        />
        <FeatureRow
          eyebrow="Multi-tenant isolation"
          title="Your hospital's data never leaves your database"
          copy="Database-per-tenant architecture. Each hospital gets its own MongoDB instance, its own users, its own audit log — enforced at the infrastructure layer, not by application logic."
          bullets={[
            "Dedicated MongoDB per hospital",
            "Tenant-scoped authentication middleware",
            "Isolated backups, usage metering, and billing",
          ]}
          visual={<TenantVisual />}
          reverse
          surface="card"
        />
        <FeatureRow
          eyebrow="Passwordless security"
          title="WebAuthn passkeys. Biometric by default."
          copy="Doctors sign in with FaceID, TouchID, or a hardware key. Nothing to phish, nothing to steal. Invite-code onboarding gets your team running in minutes."
          bullets={[
            "FIDO2 / WebAuthn passkeys",
            "Email OTP fallback for recovery",
            "Role-based access: doctor, admin, superadmin",
          ]}
          visual={<PasskeyVisual />}
        />
        <HowItWorks />
        <FeatureGrid />
        <CtaStrip />
      </main>

      <SiteFooter />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * NAV
 * ════════════════════════════════════════════════════════ */
function TopNav() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--canvas)] border-b border-[var(--hairline)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-[10px] bg-[var(--primary)] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </span>
          <span className="text-[14px] sm:text-[16px] font-bold text-[var(--ink)] tracking-tight">
            AI X-Ray Analyzer
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-[14px] font-semibold text-[var(--ink)]">
          <a href="#features" className="hover:text-[var(--mute)] transition-colors">Features</a>
          <a href="#how" className="hover:text-[var(--mute)] transition-colors">How it works</a>
          <a href="#security" className="hover:text-[var(--mute)] transition-colors">Security</a>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/login"
            className="px-3 sm:px-4 h-9 sm:h-10 inline-flex items-center text-[12px] sm:text-[14px] font-bold text-[var(--ink)] bg-transparent hover:bg-[var(--surface-card)] rounded-[9999px] transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-3 sm:px-4 h-9 sm:h-10 inline-flex items-center text-[12px] sm:text-[14px] font-bold text-[var(--on-primary)] bg-[var(--primary)] hover:bg-[var(--primary-pressed)] rounded-[9999px] transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
 * HERO
 * ════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="px-4 sm:px-6 pt-10 sm:pt-16 lg:pt-24 pb-10 sm:pb-16">
      <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
        {/* ─ Copy ─ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-card)] rounded-[9999px] mb-5 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="text-[12px] font-bold text-[var(--ink)]">AI diagnostics for radiology</span>
          </div>

          <h1
            className="text-[36px] sm:text-[48px] md:text-[56px] lg:text-[70px] font-semibold text-[var(--ink)] leading-[1.05] mb-5 sm:mb-6"
            style={{ letterSpacing: "-1.2px" }}
          >
            AI-powered diagnostics for every hospital.
          </h1>

          <p className="text-[15px] sm:text-[17px] text-[var(--body)] max-w-xl leading-[1.5] mb-6 sm:mb-8">
            Upload chest X-rays, receive instant predictions with Grad-CAM visual
            explanations. Every hospital operates in a fully isolated environment —
            its own database, staff, and audit trail.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-8">
            <Link
              to="/register"
              className="h-12 px-6 inline-flex items-center justify-center gap-2 text-[14px] font-bold text-[var(--on-primary)] bg-[var(--primary)] hover:bg-[var(--primary-pressed)] rounded-[9999px] transition-colors"
            >
              Get started free
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
            <Link
              to="/login"
              className="h-12 px-6 inline-flex items-center justify-center text-[14px] font-bold text-[var(--ink)] bg-[var(--secondary-bg)] hover:bg-[var(--secondary-pressed)] rounded-[9999px] transition-colors"
            >
              Sign in
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[var(--mute)]">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[var(--success)]" strokeWidth={2.5} /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[var(--success)]" strokeWidth={2.5} /> HIPAA-ready</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[var(--success)]" strokeWidth={2.5} /> 5 doctors free</span>
          </div>
        </motion.div>

        {/* ─ Visual ─ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-[4/5] max-w-md mx-auto lg:max-w-none">
      {/* Background card */}
      <div className="absolute inset-0 bg-[var(--surface-card)] rounded-[32px]" />

      {/* X-ray panel */}
      <div className="relative bg-[var(--surface-dark)] rounded-[32px] h-full p-4 sm:p-6 flex flex-col overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
              <Stethoscope className="w-3 h-3 text-white" />
            </div>
            <span className="text-[11px] sm:text-[12px] font-semibold text-white/90">Patient #A-2041</span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-white/50 font-mono">2026-05-13</span>
        </div>

        {/* X-ray image mock */}
        <div className="flex-1 relative rounded-[16px] overflow-hidden bg-gradient-to-b from-[#1a1a18] to-[#0a0a08]">
          <XraySvg />
          {/* Heatmap blob */}
          <div
            className="absolute top-[28%] right-[26%] w-[38%] aspect-square rounded-full opacity-70 mix-blend-screen"
            style={{
              background:
                "radial-gradient(circle, rgba(230,0,35,0.9) 0%, rgba(230,0,35,0.4) 35%, rgba(230,0,35,0) 70%)",
            }}
          />
          {/* Pin-overlay label */}
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-white rounded-[9999px] text-[10px] sm:text-[11px] font-bold text-[var(--ink)]">
            Grad-CAM active
          </div>
          {/* Bottom overlay stats */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-[9999px]">
              <span className="text-[10px] sm:text-[11px] font-semibold text-white">Pneumonia · 94.2%</span>
            </div>
            <div className="px-2.5 py-1 bg-[var(--primary)] rounded-[9999px]">
              <span className="text-[10px] sm:text-[11px] font-bold text-white">Review</span>
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2">
          <ConfChip label="Pneumonia" pct={94} primary />
          <ConfChip label="Effusion" pct={18} />
          <ConfChip label="Normal" pct={6} />
        </div>
      </div>

      {/* Floating "analyzed in" badge */}
      <div className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 bg-white rounded-[16px] px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm border border-[var(--hairline)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[var(--success-pale)] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-[var(--success)]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] text-[var(--mute)] font-medium leading-none">Analyzed in</p>
            <p className="text-[13px] sm:text-[14px] font-bold text-[var(--ink)] leading-none mt-0.5">2.1s</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfChip({ label, pct, primary }) {
  return (
    <div className="bg-white/5 rounded-[9px] p-2 border border-white/5">
      <p className="text-[9px] sm:text-[10px] text-white/60 font-medium mb-1">{label}</p>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: primary ? "var(--primary)" : "rgba(255,255,255,0.4)",
          }}
        />
      </div>
      <p className="text-[10px] sm:text-[11px] font-bold text-white mt-1">{pct}%</p>
    </div>
  );
}

function XraySvg() {
  return (
    <svg viewBox="0 0 300 400" className="w-full h-full opacity-70" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="lungGrad" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="#2a2a26" />
          <stop offset="100%" stopColor="#0a0a08" />
        </radialGradient>
      </defs>
      {/* Chest silhouette */}
      <path
        d="M60 80 Q60 60 90 55 L120 60 L150 50 L180 60 L210 55 Q240 60 240 80 L250 200 Q250 260 230 310 L220 360 L80 360 L70 310 Q50 260 50 200 Z"
        fill="url(#lungGrad)"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />
      {/* Spine */}
      <rect x="148" y="70" width="4" height="290" fill="rgba(255,255,255,0.15)" />
      {/* Ribs */}
      {[110, 140, 170, 200, 230, 260].map((y, i) => (
        <g key={i} opacity={0.18}>
          <path
            d={`M70 ${y} Q150 ${y + 15} 230 ${y}`}
            stroke="white"
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      ))}
      {/* Clavicles */}
      <path d="M70 95 Q110 85 145 95" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      <path d="M155 95 Q190 85 230 95" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
      {/* Heart shadow */}
      <ellipse cx="130" cy="220" rx="38" ry="55" fill="rgba(255,255,255,0.08)" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
 * TRUST BAR
 * ════════════════════════════════════════════════════════ */
function TrustBar() {
  return (
    <section className="px-4 sm:px-6 py-8 sm:py-12 border-y border-[var(--hairline)] bg-[var(--canvas)]">
      <div className="max-w-[1280px] mx-auto">
        <p className="text-center text-[12px] font-semibold text-[var(--mute)] uppercase tracking-wider mb-5 sm:mb-6">
          Trusted infrastructure · Built for clinical environments
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Metric value="99.2%" label="Model accuracy" />
          <Metric value="<3s" label="Avg inference time" />
          <Metric value="100%" label="Tenant isolation" />
          <Metric value="24/7" label="Audit logging" />
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[var(--ink)] leading-none" style={{ letterSpacing: "-1px" }}>
        {value}
      </p>
      <p className="text-[12px] sm:text-[13px] text-[var(--mute)] font-medium mt-1.5 sm:mt-2">{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * FEATURE ROW (alternating left/right)
 * ════════════════════════════════════════════════════════ */
function FeatureRow({ eyebrow, title, copy, bullets, visual, reverse = false, surface = "soft" }) {
  const bg = surface === "card" ? "bg-[var(--surface-card)]" : "bg-[var(--surface-soft)]";
  return (
    <section id="features" className={`px-4 sm:px-6 py-12 sm:py-16 lg:py-20 ${bg}`}>
      <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className={reverse ? "lg:order-2" : ""}>
          <p className="text-[12px] font-bold text-[var(--primary)] uppercase tracking-wider mb-3 sm:mb-4">
            {eyebrow}
          </p>
          <h2
            className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[var(--ink)] leading-[1.15] mb-4 sm:mb-5"
            style={{ letterSpacing: "-0.8px" }}
          >
            {title}
          </h2>
          <p className="text-[15px] sm:text-[17px] text-[var(--body)] leading-[1.5] mb-5 sm:mb-6">
            {copy}
          </p>
          <ul className="space-y-2.5 sm:space-y-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] sm:text-[15px] text-[var(--ink)]">
                <span className="mt-1 w-4 h-4 rounded-full bg-[var(--success-pale)] flex-shrink-0 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-[var(--success)]" strokeWidth={3} />
                </span>
                <span className="font-medium">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={reverse ? "lg:order-1" : ""}>
          {visual}
        </div>
      </div>
    </section>
  );
}

function HeatmapVisual() {
  return (
    <div className="relative aspect-[4/3] bg-[var(--canvas)] rounded-[32px] p-4 sm:p-6 border border-[var(--hairline)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-bold text-[var(--ink)]">Grad-CAM overlay</span>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--ash)]" />
          ))}
        </div>
      </div>
      <div className="relative h-[calc(100%-2rem)] rounded-[16px] overflow-hidden bg-[#0a0a08]">
        <XraySvg />
        {/* Multiple heat regions */}
        <div
          className="absolute top-[20%] right-[22%] w-[35%] aspect-square rounded-full opacity-75 mix-blend-screen"
          style={{ background: "radial-gradient(circle, rgba(230,0,35,0.95) 0%, rgba(255,140,0,0.5) 35%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[30%] left-[25%] w-[25%] aspect-square rounded-full opacity-60 mix-blend-screen"
          style={{ background: "radial-gradient(circle, rgba(255,200,0,0.8) 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <span className="px-2 py-1 bg-white rounded-[9999px] text-[10px] font-bold">Attention map</span>
          <span className="text-[10px] text-white/70 font-mono">94.2% conf.</span>
        </div>
      </div>
    </div>
  );
}

function TenantVisual() {
  const tenants = [
    { name: "Mercy General", color: "var(--primary)", scans: "1.2k" },
    { name: "St. Mary's", color: "#6845ab", scans: "834" },
    { name: "Northside Medical", color: "#435ee5", scans: "2.1k" },
  ];
  return (
    <div className="relative aspect-[4/3] bg-[var(--canvas)] rounded-[32px] p-4 sm:p-6 border border-[var(--hairline)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-bold text-[var(--ink)]">Isolated tenants</span>
        <span className="text-[10px] font-mono text-[var(--mute)]">kubectl get ns</span>
      </div>
      <div className="space-y-2.5 sm:space-y-3">
        {tenants.map((t, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-[var(--surface-card)] rounded-[16px]">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
              style={{ background: `${t.color}15`, color: t.color }}
            >
              <Database className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] sm:text-[14px] font-bold text-[var(--ink)] truncate">{t.name}</p>
              <p className="text-[11px] text-[var(--mute)] font-mono">tenant_{t.name.toLowerCase().replace(/[^a-z]/g, "_")}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[13px] sm:text-[14px] font-bold text-[var(--ink)]">{t.scans}</p>
              <p className="text-[10px] text-[var(--mute)]">scans</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 sm:mt-4 flex items-center gap-2 text-[11px] text-[var(--mute)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
        <span>All tenants healthy · zero cross-tenant access</span>
      </div>
    </div>
  );
}

function PasskeyVisual() {
  return (
    <div className="relative aspect-[4/3] bg-[var(--canvas)] rounded-[32px] p-4 sm:p-6 border border-[var(--hairline)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-bold text-[var(--ink)]">Sign in</span>
        <div className="px-2 py-0.5 bg-[var(--success-pale)] rounded-[9999px]">
          <span className="text-[10px] font-bold text-[var(--success)]">SECURE</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[var(--surface-card)] flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--canvas)] border-2 border-[var(--ink)] flex items-center justify-center">
              <Lock className="w-7 h-7 sm:w-9 sm:h-9 text-[var(--ink)]" strokeWidth={1.8} />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
        <p className="text-[13px] sm:text-[14px] font-bold text-[var(--ink)] mt-4">Authenticating with Touch ID…</p>
        <p className="text-[11px] sm:text-[12px] text-[var(--mute)] mt-1">dr.patel@mercygeneral.com</p>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {["FaceID", "TouchID", "YubiKey"].map((k) => (
          <div key={k} className="px-2 py-1.5 bg-[var(--surface-card)] rounded-[9999px] text-center">
            <span className="text-[10px] sm:text-[11px] font-bold text-[var(--ink)]">{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
 * HOW IT WORKS
 * ════════════════════════════════════════════════════════ */
function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: <FileText className="w-5 h-5" />,
      title: "Upload X-ray",
      desc: "Doctor opens a patient record and uploads a chest X-ray image.",
    },
    {
      step: "02",
      icon: <Brain className="w-5 h-5" />,
      title: "AI analyzes",
      desc: "Deep learning model runs inference and generates a Grad-CAM heatmap.",
    },
    {
      step: "03",
      icon: <Activity className="w-5 h-5" />,
      title: "Review results",
      desc: "Prediction, confidence score, and heatmap overlay — ready in under 3 seconds.",
    },
  ];
  return (
    <section id="how" className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20 bg-[var(--canvas)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-[12px] font-bold text-[var(--primary)] uppercase tracking-wider mb-3">How it works</p>
          <h2
            className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[var(--ink)] leading-[1.15]"
            style={{ letterSpacing: "-0.8px" }}
          >
            From upload to diagnosis in three steps
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 relative">
          {steps.map((s, i) => (
            <div key={i} className="relative bg-[var(--surface-card)] rounded-[16px] sm:rounded-[32px] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <span className="text-[36px] sm:text-[44px] font-bold text-[var(--ink)]/10 leading-none" style={{ letterSpacing: "-1.5px" }}>
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-full bg-[var(--canvas)] flex items-center justify-center text-[var(--ink)]">
                  {s.icon}
                </div>
              </div>
              <h3 className="text-[18px] sm:text-[20px] font-bold text-[var(--ink)] mb-2" style={{ letterSpacing: "-0.3px" }}>
                {s.title}
              </h3>
              <p className="text-[14px] sm:text-[15px] text-[var(--body)] leading-[1.5]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
 * FEATURE GRID
 * ════════════════════════════════════════════════════════ */
function FeatureGrid() {
  const items = [
    { icon: <Database className="w-5 h-5" />, title: "Database-per-tenant", desc: "Each hospital's data lives in its own MongoDB instance. Zero shared rows." },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Passkey authentication", desc: "WebAuthn biometric login — FaceID, TouchID, and hardware keys." },
    { icon: <Zap className="w-5 h-5" />, title: "Invite-code onboarding", desc: "Admins generate codes. Doctors join in under a minute." },
    { icon: <Users className="w-5 h-5" />, title: "Role-based access", desc: "Doctor, hospital admin, super admin — enforced at the route layer." },
    { icon: <Activity className="w-5 h-5" />, title: "Usage metering", desc: "Scan quotas, seat limits, and plan management per hospital." },
    { icon: <Brain className="w-5 h-5" />, title: "Explainable AI", desc: "Grad-CAM heatmaps show exactly where the model is looking." },
  ];
  return (
    <section id="security" className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20 bg-[var(--surface-soft)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="text-[12px] font-bold text-[var(--primary)] uppercase tracking-wider mb-3">Platform</p>
          <h2
            className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-[var(--ink)] leading-[1.15]"
            style={{ letterSpacing: "-0.8px" }}
          >
            Built for hospital-grade workflows
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((it, i) => (
            <div key={i} className="p-5 sm:p-6 bg-[var(--canvas)] rounded-[16px] border border-[var(--hairline)] hover:border-[var(--ash)] transition-colors">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--surface-card)] flex items-center justify-center text-[var(--ink)] mb-4">
                {it.icon}
              </div>
              <h3 className="text-[16px] sm:text-[17px] font-bold text-[var(--ink)] mb-1.5" style={{ letterSpacing: "-0.2px" }}>
                {it.title}
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[var(--body)] leading-[1.5]">
                {it.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
 * DARK CTA STRIP
 * ════════════════════════════════════════════════════════ */
function CtaStrip() {
  return (
    <section className="px-4 sm:px-6 py-10 sm:py-16">
      <div className="max-w-[1280px] mx-auto">
        <div className="bg-[var(--surface-dark)] rounded-[32px] p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
          {/* Decorative red dot */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)" }}
          />
          <div className="relative">
            <h2
              className="text-[28px] sm:text-[36px] md:text-[44px] font-bold text-white leading-[1.15] mb-4 max-w-2xl mx-auto"
              style={{ letterSpacing: "-0.8px" }}
            >
              Ready to modernize your radiology workflow?
            </h2>
            <p className="text-[14px] sm:text-[16px] text-white/70 mb-6 sm:mb-8 max-w-lg mx-auto leading-[1.5]">
              Free tier includes 5 doctors and 100 scans per month. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <Link
                to="/register"
                className="h-12 px-6 inline-flex items-center justify-center gap-2 text-[14px] font-bold text-[var(--on-primary)] bg-[var(--primary)] hover:bg-[var(--primary-pressed)] rounded-[9999px] transition-colors"
              >
                Start free today
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <Link
                to="/login"
                className="h-12 px-6 inline-flex items-center justify-center text-[14px] font-bold text-white bg-white/10 hover:bg-white/15 rounded-[9999px] transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
 * FOOTER
 * ════════════════════════════════════════════════════════ */
function SiteFooter() {
  return (
    <footer className="bg-[var(--canvas)] border-t border-[var(--hairline)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-6 mb-8 sm:mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-[9px] bg-[var(--primary)] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
                  <circle cx="12" cy="18" r="2" />
                </svg>
              </span>
              <span className="text-[15px] font-bold text-[var(--ink)]">AI X-Ray Analyzer</span>
            </div>
            <p className="text-[13px] sm:text-[14px] text-[var(--mute)] leading-[1.5] max-w-xs">
              AI-powered radiology diagnostics with complete multi-tenant isolation.
            </p>
          </div>

          <FooterCol title="Product" links={[
            ["Features", "#features"],
            ["How it works", "#how"],
            ["Security", "#security"],
          ]} />
          <FooterCol title="Account" links={[
            ["Sign in", "/login"],
            ["Create account", "/register"],
          ]} />
          <FooterCol title="Company" links={[
            ["About", "#"],
            ["Privacy", "#"],
            ["Terms", "#"],
            ["Contact", "#"],
          ]} />
        </div>

        <div className="pt-6 sm:pt-8 border-t border-[var(--hairline)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <span className="text-[12px] text-[var(--mute)]">© 2026 AI X-Ray Analyzer. All rights reserved.</span>
          <div className="flex gap-4 sm:gap-6 text-[12px] text-[var(--mute)]">
            <a href="#" className="hover:text-[var(--ink)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--ink)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--ink)] transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="text-[13px] font-bold text-[var(--ink)] mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <a
              href={href}
              className="text-[13px] sm:text-[14px] text-[var(--mute)] hover:text-[var(--ink)] transition-colors"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
