import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { listRoster, removeDoctor } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { Users, Trash2, CheckCircle, XCircle, ShieldCheck, Copy } from "lucide-react";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function Roster() {
  const { user } = useAuth();
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const load = async () => {
    try {
      const data = await listRoster();
      setRoster(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (email) => {
    try {
      await removeDoctor(email);
      toast.success(`${email} removed from hospital`);
      setConfirmRemove(null);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to remove doctor");
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><LoadingSpinner size="lg" text="Loading roster..." /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Roster</h1>
          <p className="text-gray-400 mt-1">{roster.length} doctor{roster.length !== 1 ? "s" : ""} in your hospital.</p>
        </div>
      </div>

      {/* Invite code banner */}
      {user?.invite_code && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-blue-900">Invite Code</p>
            <p className="text-sm text-blue-600">Share this code with doctors to join your hospital.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-mono font-bold text-blue-700 bg-white px-4 py-2 rounded-xl border border-blue-100">{user.invite_code}</span>
            <button onClick={() => { navigator.clipboard.writeText(user.invite_code); toast.success("Invite code copied!"); }} className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {roster.length === 0 ? (
        <EmptyState icon={Users} title="No doctors yet" description="Share your invite code to onboard doctors." />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {roster.map((d) => (
            <div key={d.email} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  {d.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{d.email}</p>
                  <p className="text-xs text-gray-400">{d.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={d.is_verified ? "success" : "warning"}>
                  {d.is_verified ? "Verified" : "Pending"}
                </Badge>
                <Badge variant={d.has_passkey ? "info" : "default"}>
                  {d.has_passkey ? "Passkey" : "Password"}
                </Badge>
                <button onClick={() => setConfirmRemove(d.email)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => handleRemove(confirmRemove)}
        title="Remove Doctor"
        message={`Remove ${confirmRemove} from your hospital? They will lose access to all tenant resources.`}
        confirmText="Remove"
      />
    </div>
  );
}
