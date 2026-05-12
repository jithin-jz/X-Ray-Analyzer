import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { ShieldCheck, Database, Zap, Brain, Users, Activity } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--surface-soft)] flex flex-col">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 w-full bg-[var(--canvas)] border-b border-[var(--hairline)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-[15px] sm:text-lg font-bold text-[var(--ink)] tracking-tight">
            AI X-Ray Analyzer
          </span>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-[var(--ink)] bg-[var(--secondary-bg)] rounded-[9999px] hover:bg-[var(--secondary-pressed)] transition-colors">
              Log in
            </Link>
            <Link to="/register" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-[var(--on-primary)] bg-[var(--primary)] rounded-[9999px] hover:bg-[var(--primary-pressed)] transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-4 sm:px-6 pt-8 sm:pt-16 md:pt-20 pb-6 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1
            className="text-[26px] sm:text-[40px] md:text-[56px] lg:text-[70px] font-semibold text-[var(--ink)] leading-[1.1] mb-3 sm:mb-5"
            style={{ letterSpacing: "-1.2px" }}
          >
            AI-powered diagnostics for every hospital
          </h1>
          <p className="text-[13px] sm:text-base text-[var(--mute)] max-w-md sm:max-w-xl mx-auto mb-5 sm:mb-8 leading-[1.5]">
            Upload X-rays, get instant AI analysis with Grad-CAM explanations.
            Each hospital gets its own secure, isolated environment.
          </p>
          <div className="flex flex-row gap-2 sm:gap-3 sm:justify-center">
            <Link to="/register" className="flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-6 py-3 text-[13px] sm:text-[14px] font-bold text-[var(--on-primary)] bg-[var(--primary)] rounded-[9999px] hover:bg-[var(--primary-pressed)] transition-colors">
              Get started free
            </Link>
            <Link to="/login" className="flex-1 sm:flex-none flex items-center justify-center px-4 sm:px-6 py-3 text-[13px] sm:text-[14px] font-bold text-[var(--ink)] bg-[var(--secondary-bg)] rounded-[9999px] hover:bg-[var(--secondary-pressed)] transition-colors">
              Log in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Stats strip ── */}
      <section className="px-4 sm:px-6 py-5 sm:py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-3 sm:p-5 text-center">
            <p className="text-[18px] sm:text-[28px] font-bold text-[var(--ink)]">99.2%</p>
            <p className="text-[10px] sm:text-xs text-[var(--mute)] font-medium mt-0.5">Accuracy</p>
          </div>
          <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-3 sm:p-5 text-center">
            <p className="text-[18px] sm:text-[28px] font-bold text-[var(--ink)]">&lt;3s</p>
            <p className="text-[10px] sm:text-xs text-[var(--mute)] font-medium mt-0.5">Analysis time</p>
          </div>
          <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-3 sm:p-5 text-center">
            <p className="text-[18px] sm:text-[28px] font-bold text-[var(--ink)]">HIPAA</p>
            <p className="text-[10px] sm:text-xs text-[var(--mute)] font-medium mt-0.5">Compliant</p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[18px] sm:text-[22px] font-semibold text-[var(--ink)] text-center mb-5 sm:mb-8" style={{ letterSpacing: "-0.5px" }}>
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <StepCard step="1" title="Upload X-Ray" description="Doctor uploads a chest X-ray image to the patient's record." />
            <StepCard step="2" title="AI Analyzes" description="Deep learning model processes the image and generates Grad-CAM heatmap." />
            <StepCard step="3" title="Get Results" description="Prediction with confidence score and visual explanation in seconds." />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-[18px] sm:text-[22px] font-semibold text-[var(--ink)] text-center mb-5 sm:mb-8" style={{ letterSpacing: "-0.5px" }}>
            Built for hospitals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
            <FeatureCard icon={<Database className="w-[18px] h-[18px]" />} title="Isolated databases" description="Each hospital gets its own MongoDB database. Complete data separation." />
            <FeatureCard icon={<ShieldCheck className="w-[18px] h-[18px]" />} title="Passkey auth" description="WebAuthn biometric login. No passwords to steal or phish." />
            <FeatureCard icon={<Zap className="w-[18px] h-[18px]" />} title="Instant setup" description="Register → get invite code → onboard your team in minutes." />
            <FeatureCard icon={<Users className="w-[18px] h-[18px]" />} title="Role-based access" description="Admins manage staff. Doctors manage patients. Clean separation." />
            <FeatureCard icon={<Activity className="w-[18px] h-[18px]" />} title="Usage tracking" description="Monitor scans per month, active doctors, and plan limits." />
            <FeatureCard icon={<Brain className="w-[18px] h-[18px]" />} title="Explainable AI" description="Grad-CAM heatmaps show exactly where the model is looking." />
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto bg-[var(--ink)] rounded-[16px] sm:rounded-[32px] p-6 sm:p-10 text-center">
          <h2 className="text-[18px] sm:text-[24px] font-semibold text-[var(--on-primary)] mb-2 sm:mb-3" style={{ letterSpacing: "-0.5px" }}>
            Ready to modernize your radiology workflow?
          </h2>
          <p className="text-[12px] sm:text-sm text-white/60 mb-4 sm:mb-6 max-w-md mx-auto">
            Free tier includes 5 doctors and 100 scans per month. No credit card required.
          </p>
          <Link to="/register" className="inline-flex items-center justify-center px-6 py-3 text-[14px] font-bold text-[var(--ink)] bg-[var(--canvas)] rounded-[9999px] hover:bg-[var(--surface-card)] transition-colors">
            Start free today
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--hairline)] bg-[var(--canvas)] mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-1.5 sm:gap-4">
          <span className="text-[11px] sm:text-xs text-[var(--mute)]">© 2026 AI X-Ray Analyzer</span>
          <div className="flex gap-4 text-[11px] sm:text-xs text-[var(--mute)]">
            <span className="hover:text-[var(--ink)] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[var(--ink)] cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ step, title, description }) {
  return (
    <div className="flex items-start gap-3 p-3.5 sm:p-5 bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px]">
      <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 bg-[var(--primary)] rounded-full flex items-center justify-center text-[var(--on-primary)] text-[11px] sm:text-xs font-bold">
        {step}
      </div>
      <div className="min-w-0">
        <h3 className="text-[13px] sm:text-[14px] font-semibold text-[var(--ink)] mb-0.5">{title}</h3>
        <p className="text-[11px] sm:text-[13px] text-[var(--mute)] leading-[1.4]">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 p-3.5 sm:p-5 bg-[var(--surface-card)] rounded-[16px]">
      <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 bg-[var(--canvas)] rounded-[10px] flex items-center justify-center text-[var(--ink)]">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-[13px] sm:text-[14px] font-semibold text-[var(--ink)] mb-0.5">{title}</h3>
        <p className="text-[11px] sm:text-[13px] text-[var(--mute)] leading-[1.4]">{description}</p>
      </div>
    </div>
  );
}
