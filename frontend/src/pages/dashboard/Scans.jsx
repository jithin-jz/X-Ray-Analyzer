import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { listScans, createScan, uploadScanImage, analyzeScan, deleteScan } from "../../api/scans";
import { listPatients } from "../../api/patients";
import { ScanLine, Plus, Upload, Zap, Trash2, Eye, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const STATUS_MAP = {
  uploaded: { label: "Uploaded", variant: "info" },
  processing: { label: "Processing", variant: "warning" },
  analyzed: { label: "Analyzed", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
};

export default function Scans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatient = searchParams.get("patient");

  const [scans, setScans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(!!preselectedPatient);
  const [selectedPatient, setSelectedPatient] = useState(preselectedPatient || "");
  const [scanType, setScanType] = useState("chest_xray");
  const [selectedFile, setSelectedFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const [s, p] = await Promise.all([listScans(), listPatients()]);
      setScans(s);
      setPatients(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedPatient) { setError("Select a patient"); return; }
    setCreating(true);
    setError("");
    try {
      const scan = await createScan({ patient_id: selectedPatient, scan_type: scanType });
      if (selectedFile) {
        await uploadScanImage(scan.scan_id, selectedFile);
      }
      setShowCreate(false);
      setSelectedFile(null);
      setSelectedPatient("");
      toast.success("Scan created successfully");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleAnalyze = async (scanId) => {
    setAnalyzing(scanId);
    try {
      await analyzeScan(scanId);
      toast.success("AI analysis complete");
      load();
    } catch (err) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (scanId) => {
    try {
      await deleteScan(scanId);
      toast.success("Scan deleted");
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to delete scan");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Loading scans..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">X-Ray Scans</h1>
          <p className="text-gray-400 mt-1">{scans.length} scan{scans.length !== 1 ? "s" : ""} total.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Scan
        </button>
      </div>

      {scans.length === 0 ? (
        <EmptyState icon={ScanLine} title="No scans yet" description="Create a scan to upload and analyze X-ray images." action={
          <button onClick={() => setShowCreate(true)} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">New Scan</button>
        } />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {scans.map((s) => {
            const status = STATUS_MAP[s.status] || STATUS_MAP.uploaded;
            const patient = patients.find((p) => p.patient_id === s.patient_id);
            return (
              <div key={s.scan_id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                    <ScanLine className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{patient?.name || "Unknown"} &mdash; {s.scan_type?.replace("_", " ")}</p>
                    <p className="text-xs text-gray-400">ID: {s.scan_id?.slice(0, 8)} &middot; {s.image_path ? "Image uploaded" : "No image"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {s.ai_result && <Badge variant="purple">{s.ai_result.prediction}</Badge>}

                  {s.status === "uploaded" && s.image_path && (
                    <button onClick={() => handleAnalyze(s.scan_id)} disabled={analyzing === s.scan_id} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1">
                      {analyzing === s.scan_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      Analyze
                    </button>
                  )}

                  <button onClick={() => navigate(`/dashboard/scans/${s.scan_id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(s.scan_id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Scan Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New X-Ray Scan">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
            <select required value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>{p.name} ({p.age}y / {p.gender})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scan Type</label>
            <select value={scanType} onChange={(e) => setScanType(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
              <option value="chest_xray">Chest X-Ray</option>
              <option value="hand_xray">Hand X-Ray</option>
              <option value="dental_xray">Dental X-Ray</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">X-Ray Image</label>
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 transition-colors">
              <input ref={fileRef} type="file" accept="image/*,.dicom" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <Upload className="w-5 h-5" />
                  <span className="font-semibold text-sm">{selectedFile.name}</span>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">Click to upload X-ray image (optional, can upload later)</div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={creating} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {creating ? "Creating..." : "Create Scan"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Delete Scan"
        message="This will permanently delete this scan and its results. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
