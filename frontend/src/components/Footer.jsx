export default function Footer() {
  return (
    <footer className="border-t border-[var(--hairline)] bg-[var(--canvas)]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="text-base font-bold text-[var(--ink)]">AI X-Ray Analyzer</span>
            <p className="text-sm text-[var(--mute)] mt-2 max-w-sm leading-relaxed">
              Secure, AI-powered radiological diagnostics. Each hospital gets its own isolated environment.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold text-[var(--ink)] mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><a href="/dashboard" className="text-sm text-[var(--mute)] hover:text-[var(--ink)] transition-colors">Dashboard</a></li>
              <li><a href="/register" className="text-sm text-[var(--mute)] hover:text-[var(--ink)] transition-colors">Register</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--ink)] mb-3">Support</h4>
            <ul className="space-y-2">
              <li><span className="text-sm text-[var(--mute)]">Documentation</span></li>
              <li><span className="text-sm text-[var(--mute)]">Contact</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-[var(--hairline)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-[var(--ash)]">© 2026 AI X-Ray Analyzer</span>
          <div className="flex gap-6 text-xs text-[var(--ash)]">
            <span className="hover:text-[var(--ink)] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[var(--ink)] cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
