import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getMyTenant, regenerateInviteCode } from "../../api/tenants";
import { Building2, RefreshCw, Copy } from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Badge from "../../components/ui/Badge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function TenantSettings() {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyTenant();
        setTenant(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRegenerate = async () => {
    if (!tenant?.hospital_id) return;
    setRegenerating(true);
    try {
      const result = await regenerateInviteCode(tenant.hospital_id);
      setTenant({ ...tenant, invite_code: result.invite_code });
      toast.success("Invite code regenerated");
      setShowRegenConfirm(false);
    } catch (err) {
      toast.error(err.message || "Failed to regenerate code");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><LoadingSpinner size="lg" text="Loading hospital settings..." /></div>;

  if (!tenant || tenant.detail) {
    return <div className="text-center py-20 text-gray-400">No hospital associated with your account.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hospital Settings</h1>
        <p className="text-gray-400 mt-1">Manage your hospital configuration.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-8">
        {/* Name & ID */}
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
            <p className="text-xs text-gray-400 font-mono">ID: {tenant.hospital_id}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Plan</p>
            <p className="text-lg font-bold text-gray-900">{tenant.plan?.toUpperCase()}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <Badge variant={tenant.is_active ? "success" : "danger"}>{tenant.is_active ? "Active" : "Inactive"}</Badge>
          </div>
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Max Users</p>
            <p className="text-lg font-bold text-gray-900">{tenant.max_users}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Max Scans/Month</p>
            <p className="text-lg font-bold text-gray-900">{tenant.max_scans_per_month?.toLocaleString()}</p>
          </div>
        </div>

        {/* Invite Code */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Invite Code</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-bold text-blue-700 bg-white px-5 py-2 rounded-xl border border-blue-100 tracking-widest">{tenant.invite_code}</span>
            <button onClick={() => { navigator.clipboard.writeText(tenant.invite_code); toast.success("Copied to clipboard"); }} className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors" title="Copy">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={() => setShowRegenConfirm(true)} disabled={regenerating} className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors disabled:opacity-50" title="Regenerate">
              <RefreshCw className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showRegenConfirm}
        onClose={() => setShowRegenConfirm(false)}
        onConfirm={handleRegenerate}
        title="Regenerate Invite Code"
        message="The old invite code will stop working immediately. Doctors who haven't joined yet will need the new code."
        confirmText="Regenerate"
        variant="warning"
      />
    </div>
  );
}
