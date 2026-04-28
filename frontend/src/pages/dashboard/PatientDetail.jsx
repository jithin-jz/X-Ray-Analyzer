import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getPatient, updatePatient } from "../../api/patients";
import { listScans } from "../../api/scans";
import { ArrowLeft, ScanLine, Plus, Clock, CheckCircle, AlertCircle, Loader2, Pencil } from "lucide-react";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";

const STATUS_MAP = {
  uploaded: { label: "Uploaded", variant: "info", icon: Clock },
  processing: { label: "Processing", variant: "warning", icon: Loader2 },
  analyzed: { label: "Analyzed", variant: "success", icon: CheckCircle },
  failed: { label: "Failed", variant: "danger", icon: AlertCircle },
};

export default function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", age: "", gender: "", contact: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [p, s] = await Promise.all([
        getPatient(patientId),
        listScans(patientId),
      ]);
      setPatient(p);
      setScans(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId]);

  const openEdit = () => {
    setEditForm({
      name: patient.name || "",
      age: patient.age?.toString() || "",
      gender: patient.gender || "M",
      contact: patient.contact || "",
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePatient(patientId, { ...editForm, age: parseInt(editForm.age, 10) });
      toast.success("Patient updated successfully");
      setShowEdit(false);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to update patient");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Loading patient..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Patient not found.</p>
        <button onClick={() => navigate("/dashboard/patients")} className="mt-4 text-blue-600 font-semibold hover:underline">Back to Patients</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button onClick={() => navigate("/dashboard/patients")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Patients
      </button>

      {/* Patient info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
              {patient.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-gray-400 text-sm mt-1">
                {patient.age}y &middot; {patient.gender} &middot; {patient.contact || "No contact"}
              </p>
              <p className="text-xs text-gray-300 font-mono mt-1">ID: {patient.patient_id}</p>
            </div>
          </div>
          <button onClick={openEdit} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
            <Pencil className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      {/* Scans */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Scans ({scans.length})</h2>
        <button onClick={() => navigate(`/dashboard/scans?patient=${patientId}`)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> New Scan
        </button>
      </div>

      {scans.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ScanLine className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No scans for this patient yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {scans.map((s) => {
            const status = STATUS_MAP[s.status] || STATUS_MAP.uploaded;
            return (
              <div key={s.scan_id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/scans/${s.scan_id}`)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                    <ScanLine className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{s.scan_type?.replace("_", " ")} scan</p>
                    <p className="text-xs text-gray-400 font-mono">ID: {s.scan_id?.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {s.ai_result && (
                    <Badge variant="purple">{s.ai_result.prediction} ({Math.round(s.ai_result.confidence * 100)}%)</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Edit Patient Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Patient">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input required type="number" min="0" max="150" value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" placeholder="+91 9876543210" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEdit(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
