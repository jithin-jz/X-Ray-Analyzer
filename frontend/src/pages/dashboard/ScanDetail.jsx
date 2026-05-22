import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getScan, uploadScanImage, analyzeScan, getBodyParts, gradcamUrl } from "../../api/scans";
import { getPatient } from "../../api/patients";
import { getAccessToken } from "../../api/client";
import {
  ArrowLeft, Upload, Zap, Loader2, CheckCircle,
  AlertCircle, Brain, FileImage, Activity, ChevronDown
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function ScanDetail() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [scan, setScan] = useState(null);
  const [patient, setPatient] = useState(null);
  const [bodyParts, setBodyParts] = useState({});
  const [selectedBodyPart, setSelectedBodyPart] = useState("chest");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const load = async () => {
    try {
      const [s, bp] = await Promise.all([getScan(scanId), getBodyParts()]);
      setScan(s);
      setBodyParts(bp);
      // Pre-select the body part from the scan (or default to chest)
      setSelectedBodyPart(s.body_part || "chest");
      if (s.patient_id) {
        const p = await getPatient(s.patient_id);
        setPatient(p);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [scanId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadScanImage(scanId, file);
      toast.success("Image uploaded successfully");
      load();
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzeScan(scanId, selectedBodyPart);
      toast.success("AI analysis complete");
      load();
    } catch (err) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><LoadingSpinner size="lg" text="Loading scan..." /></div>;
  if (!scan) return <div className="text-center py-20 text-[var(--mute)]">Scan not found.</div>;

  const statusColors = { uploaded: "info", processing: "warning", analyzed: "success", failed: "danger" };
  const ai = scan.ai_result;
  const bpLabel = bodyParts[scan.body_part]?.label || ai?.body_part_label || scan.body_part || "Scan";

  // Confidence colour
  const confColor = ai
    ? ai.confidence >= 0.85 ? "#10b981" : ai.confidence >= 0.6 ? "#f59e0b" : "#ef4444"
    : "#10b981";

  return (
    <div className="space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--mute)] hover:text-[var(--ink)] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Scan header */}
      <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)] mb-1">{bpLabel} X-Ray</h1>
            <p className="text-sm text-[var(--ash)]">Patient: <span className="font-semibold text-[var(--mute)]">{patient?.name || scan.patient_id?.slice(0, 8)}</span></p>
            <p className="text-xs text-[var(--ash)] font-mono mt-2">Scan ID: {scan.scan_id}</p>
          </div>
          <Badge variant={statusColors[scan.status]}>{scan.status?.toUpperCase()}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left: Image + Controls ── */}
        <div className="space-y-4">
          <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6">
            <h2 className="text-sm font-bold text-[var(--mute)] uppercase tracking-widest mb-4">X-Ray Image</h2>
            {scan.image_path ? (
              <div className="bg-[var(--surface-card)] rounded-[16px] p-4 flex flex-col items-center gap-3">
                <FileImage className="w-16 h-16 text-blue-400" strokeWidth={1} />
                <p className="text-sm text-[var(--mute)] font-mono text-center break-all">{scan.image_path}</p>
                <Badge variant="success">Uploaded</Badge>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[var(--hairline)] rounded-[16px] p-12 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <input ref={fileRef} type="file" accept="image/*,.dicom" onChange={handleUpload} className="hidden" />
                <Upload className="w-10 h-10 text-[var(--ash)]" />
                <p className="text-sm text-[var(--ash)]">{uploading ? "Uploading..." : "Click to upload X-ray image"}</p>
              </div>
            )}
          </div>

          {/* Body part selector + analyze button */}
          {scan.image_path && (scan.status === "uploaded" || scan.status === "analyzed" || scan.status === "failed") && (
            <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6 space-y-3">
              <h2 className="text-sm font-bold text-[var(--mute)] uppercase tracking-widest">Run AI Analysis</h2>
              <div className="relative">
                <select
                  value={selectedBodyPart}
                  onChange={(e) => setSelectedBodyPart(e.target.value)}
                  className="w-full px-4 py-3 pr-10 bg-[var(--surface-card)] border border-[var(--hairline)] rounded-[16px] text-sm appearance-none focus:outline-none focus:border-[var(--ink)]"
                >
                  {Object.entries(bodyParts).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                  {Object.keys(bodyParts).length === 0 && <option value="chest">Chest / Thorax</option>}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ash)] pointer-events-none" />
              </div>
              {bodyParts[selectedBodyPart]?.description && (
                <p className="text-xs text-[var(--ash)]">{bodyParts[selectedBodyPart].description}</p>
              )}
              {bodyParts[selectedBodyPart]?.conditions && (
                <div className="flex flex-wrap gap-1.5">
                  {bodyParts[selectedBodyPart].conditions.map((c) => (
                    <span key={c} className="text-xs px-2 py-0.5 bg-[var(--surface-card)] text-[var(--mute)] rounded-full">{c.replace(/_/g, " ")}</span>
                  ))}
                </div>
              )}
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full py-3 bg-emerald-600 text-white rounded-[16px] font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {analyzing ? "Analyzing..." : scan.status === "analyzed" ? "Re-analyze" : "Run AI Analysis"}
              </button>
            </div>
          )}
        </div>

        {/* ── Right: AI Results ── */}
        <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6">
          <h2 className="text-sm font-bold text-[var(--mute)] uppercase tracking-widest mb-4">AI Diagnosis</h2>

          {ai ? (
            <div className="space-y-5">
              {/* Prediction card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-[16px] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">
                      {ai.body_part_label || bpLabel}
                    </p>
                    <p className="text-2xl font-black text-emerald-900">{ai.prediction?.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div>
                    <p className="text-xs text-[var(--mute)] font-bold uppercase">Confidence</p>
                    <p className="text-lg font-bold text-[var(--ink)]">{Math.round(ai.confidence * 100)}%</p>
                  </div>
                  <div className="flex-1 h-2 bg-[var(--surface-card)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${ai.confidence * 100}%`, backgroundColor: confColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Probabilities breakdown */}
              {ai.probabilities && Object.keys(ai.probabilities).length > 0 && (
                <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-[16px] p-5">
                  <p className="text-xs font-bold text-[var(--mute)] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Condition Probabilities
                  </p>
                  <div className="space-y-2.5">
                    {Object.entries(ai.probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([condition, prob]) => (
                        <div key={condition}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[var(--ink)] font-medium">{condition.replace(/_/g, " ")}</span>
                            <span className="text-[var(--mute)] font-mono">{Math.round(prob * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-[var(--hairline)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${prob * 100}%`,
                                backgroundColor: condition === ai.prediction ? confColor : "#94a3b8",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Patient summary */}
              {ai.patient_summary && (
                typeof ai.patient_summary === "string" ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-[16px] p-5">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">Patient Summary</p>
                    <p className="text-sm text-blue-900 leading-relaxed">{ai.patient_summary}</p>
                  </div>
                ) : (
                  <div className={`rounded-[16px] p-6 border ${
                    ai.patient_summary.urgency === "urgent"
                      ? "bg-red-50 border-red-100 text-red-900"
                      : ai.patient_summary.urgency === "soon"
                      ? "bg-amber-50 border-amber-100 text-amber-900"
                      : ai.patient_summary.urgency === "watch"
                      ? "bg-blue-50 border-blue-100 text-blue-900"
                      : "bg-emerald-50 border-emerald-100 text-emerald-900"
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{ai.patient_summary.emoji}</span>
                      <h3 className="text-lg font-bold">{ai.patient_summary.headline}</h3>
                    </div>
                    <div className="space-y-3 text-sm leading-relaxed">
                      <div>
                        <span className="font-semibold block text-[10px] uppercase tracking-wider opacity-75">What the AI saw:</span>
                        <p className="mt-0.5">{ai.patient_summary.what_found}</p>
                      </div>
                      {ai.patient_summary.what_it_means && (
                        <div>
                          <span className="font-semibold block text-[10px] uppercase tracking-wider opacity-75">What it means for you:</span>
                          <p className="mt-0.5">{ai.patient_summary.what_it_means}</p>
                        </div>
                      )}
                      {ai.patient_summary.what_to_do && (
                        <div>
                          <span className="font-semibold block text-[10px] uppercase tracking-wider opacity-75">Recommended Action:</span>
                          <p className="mt-0.5">{ai.patient_summary.what_to_do}</p>
                        </div>
                      )}
                      {ai.patient_summary.confidence_text && (
                        <p className="text-xs italic opacity-60 pt-2.5 border-t border-current/10 mt-1">
                          {ai.patient_summary.confidence_text}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Clinical explanation */}
              {ai.rag_explanation && (
                <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-[16px] p-5">
                  <p className="text-xs text-[var(--primary)] font-bold uppercase tracking-widest mb-2">Clinical Notes</p>
                  <p className="text-sm text-[var(--ink)] leading-relaxed">{ai.rag_explanation}</p>
                </div>
              )}

              {/* Grad-CAM heatmap */}
              {ai.gradcam_path && (
                <div className="bg-[var(--surface-card)] border border-[var(--hairline)] rounded-[16px] p-5">
                  <p className="text-xs text-[var(--mute)] font-bold uppercase tracking-widest mb-3">Grad-CAM Heatmap</p>
                  <img
                    src={gradcamUrl(scan.scan_id)}
                    alt="Grad-CAM heatmap"
                    className="w-full rounded-[12px] object-contain max-h-64"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <p className="text-xs text-[var(--ash)] mt-2 text-center">AI attention map — highlighted regions drove the prediction</p>
                </div>
              )}
            </div>
          ) : scan.status === "processing" ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              <p className="text-[var(--ash)]">Analysis in progress...</p>
            </div>
          ) : scan.status === "failed" ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-red-500 font-semibold">Analysis failed</p>
              <button onClick={handleAnalyze} className="text-sm text-[var(--primary)] hover:underline">Retry</button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 gap-4 text-[var(--ash)]">
              <CheckCircle className="w-10 h-10" />
              <p className="text-[var(--ash)]">Upload an image and run analysis to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
