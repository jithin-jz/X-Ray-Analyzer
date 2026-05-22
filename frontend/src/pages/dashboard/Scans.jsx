import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { listScans, createScan, uploadScanImage, analyzeScan, deleteScan, getBodyParts } from "../../api/scans";
import { listPatients } from "../../api/patients";
import { ScanLine, Plus, Zap, Trash2, Eye, Loader2, Activity } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const STATUS_MAP = { uploaded: "info", processing: "warning", analyzed: "success", failed: "danger" };

export default function Scans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatient = searchParams.get("patient");
  const [scans, setScans] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bodyParts, setBodyParts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(!!preselectedPatient);
  const [selectedPatient, setSelectedPatient] = useState(preselectedPatient || "");
  const [bodyPart, setBodyPart] = useState("chest");
  const [selectedFile, setSelectedFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const [s, p, bp] = await Promise.all([listScans(), listPatients(), getBodyParts()]);
      setScans(s);
      setPatients(p);
      setBodyParts(bp);
    } catch { /* ignore */ } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedPatient) { setError("Select a patient"); return; }
    setCreating(true); setError("");
    try {
      const scan = await createScan({ patient_id: selectedPatient, body_part: bodyPart, scan_type: "xray" });
      if (selectedFile) await uploadScanImage(scan.scan_id, selectedFile);
      setShowCreate(false); setSelectedFile(null); setSelectedPatient("");
      toast.success("Scan created"); load();
    } catch (err) { setError(err.message); } finally { setCreating(false); }
  };

  const handleAnalyze = async (scan) => {
    setAnalyzing(scan.scan_id);
    try {
      await analyzeScan(scan.scan_id, scan.body_part || "chest");
      toast.success("Analysis complete");
      load();
    } catch (err) { toast.error(err.message); } finally { setAnalyzing(null); }
  };

  const handleDelete = async (scanId) => {
    try { await deleteScan(scanId); toast.success("Scan deleted"); setConfirmDelete(null); load(); }
    catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><LoadingSpinner text="Loading scans..." /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[var(--ink)]" style={{ letterSpacing: "-1.2px" }}>X-Ray Scans</h1>
          <p className="text-[13px] sm:text-sm text-[var(--mute)] mt-0.5">{scans.length} total</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-[var(--on-primary)] bg-[var(--primary)] rounded-[9999px] hover:bg-[var(--primary-pressed)] transition-colors w-full sm:w-auto">
          <Plus className="w-4 h-4" /> New Scan
        </button>
      </div>

      {scans.length === 0 ? (
        <EmptyState icon={ScanLine} title="No scans yet" description="Create a scan to upload and analyze X-ray images." />
      ) : (
        <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] overflow-hidden divide-y divide-[var(--hairline)]">
          {scans.map((s) => {
            const patient = patients.find((p) => p.patient_id === s.patient_id);
            const bpLabel = bodyParts[s.body_part]?.label || s.body_part || "Scan";
            return (
              <div key={s.scan_id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[var(--surface-card)] rounded-[16px] flex items-center justify-center text-[var(--mute)]"><Activity className="w-4 h-4" /></div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">{patient?.name || "Unknown"} — {bpLabel}</p>
                    <p className="text-xs text-[var(--ash)]">
                      {s.ai_result ? `${s.ai_result.prediction} · ${Math.round(s.ai_result.confidence * 100)}%` : s.image_path ? "Image uploaded" : "No image"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_MAP[s.status]}>{s.status}</Badge>
                  {s.ai_result && <Badge variant="purple">{s.ai_result.prediction}</Badge>}
                  {s.status === "uploaded" && s.image_path && (
                    <button onClick={() => handleAnalyze(s)} disabled={analyzing === s.scan_id} className="px-3 py-1.5 text-xs font-bold text-[var(--on-primary)] bg-[var(--primary)] rounded-[9999px] hover:bg-[var(--primary-pressed)] disabled:opacity-50 flex items-center gap-1 transition-colors">
                      {analyzing === s.scan_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Analyze
                    </button>
                  )}
                  <button onClick={() => navigate(`/dashboard/scans/${s.scan_id}`)} className="p-2 text-[var(--ash)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)] rounded-[16px] transition-colors"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmDelete(s.scan_id)} className="p-2 text-[var(--ash)] hover:text-[var(--error)] hover:bg-red-50 rounded-[16px] transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create scan modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New X-Ray Scan">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 rounded-[16px] bg-red-50 text-[var(--error)] text-sm">{error}</div>}

          {/* Patient selector */}
          <select required value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} className="w-full px-4 py-3 bg-[var(--surface-card)] border border-[var(--hairline)] rounded-[16px] text-sm focus:outline-none focus:border-[var(--ink)]">
            <option value="">Select patient...</option>
            {patients.map((p) => <option key={p.patient_id} value={p.patient_id}>{p.name} ({p.age}y)</option>)}
          </select>

          {/* Body part selector (dynamic from API) */}
          <select value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} className="w-full px-4 py-3 bg-[var(--surface-card)] border border-[var(--hairline)] rounded-[16px] text-sm focus:outline-none focus:border-[var(--ink)]">
            {Object.entries(bodyParts).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
            {Object.keys(bodyParts).length === 0 && <option value="chest">Chest / Thorax</option>}
          </select>

          {/* Optional description of selected body part */}
          {bodyParts[bodyPart]?.description && (
            <p className="text-xs text-[var(--ash)] px-1">{bodyParts[bodyPart].description}</p>
          )}

          {/* File upload */}
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-[var(--hairline)] rounded-[16px] p-8 text-center cursor-pointer hover:border-[var(--ash)] transition-colors">
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
            {selectedFile ? <span className="text-sm font-semibold text-[var(--ink)]">{selectedFile.name}</span> : <span className="text-sm text-[var(--ash)]">Click to upload X-ray image (optional — can upload later)</span>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 text-sm font-bold text-[var(--ink)] bg-[var(--secondary-bg)] rounded-[16px] hover:bg-[var(--secondary-pressed)] transition-colors">Cancel</button>
            <button type="submit" disabled={creating} className="flex-1 py-3 text-sm font-bold text-[var(--on-primary)] bg-[var(--primary)] rounded-[16px] hover:bg-[var(--primary-pressed)] disabled:opacity-50 transition-colors">{creating ? "Creating..." : "Create"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => handleDelete(confirmDelete)} title="Delete Scan" message="This will permanently delete this scan." confirmText="Delete" />
    </div>
  );
}
