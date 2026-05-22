import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getScan, uploadScanImage, analyzeScan, getBodyParts, gradcamUrl, scanImageUrl } from "../../api/scans";
import { getPatient } from "../../api/patients";
import {
  ArrowLeft, Upload, Zap, Loader2, CheckCircle,
  AlertCircle, Brain, FileImage, Activity, ChevronDown,
  ShieldAlert, BadgeInfo, FileText, Heart, Eye
} from "lucide-react";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import AuthImage from "../../components/ui/AuthImage";

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
  const [zoomImage, setZoomImage] = useState(false);

  const load = async () => {
    try {
      const [s, bp] = await Promise.all([getScan(scanId), getBodyParts()]);
      setScan(s);
      setBodyParts(bp);
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

  useEffect(() => {
    load();
  }, [scanId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <LoadingSpinner size="lg" text="Loading scan details..." />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="text-center py-20 text-[var(--mute)]">
        <AlertCircle className="w-12 h-12 text-[var(--ash)] mx-auto mb-4" />
        <p className="text-lg font-semibold">Scan not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[var(--primary)] hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const statusColors = {
    uploaded: "info",
    processing: "warning",
    analyzed: "success",
    failed: "danger"
  };

  const ai = scan.ai_result;
  const bpLabel = bodyParts[scan.body_part]?.label || ai?.body_part_label || scan.body_part || "Scan";

  // Compute colors dynamically based on prediction & confidence
  const isNormal = ai?.prediction?.toLowerCase().includes("normal");
  let diagCardStyles = "bg-emerald-50 border-emerald-100 text-emerald-950 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)]";
  let diagThemeColor = "#10b981"; // Emerald
  let diagHeaderTextColor = "text-emerald-700";
  let diagIcon = <Heart className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />;

  if (ai) {
    if (!isNormal) {
      if (ai.confidence >= 0.85) {
        diagCardStyles = "bg-red-50 border-red-100 text-red-950 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.1)]";
        diagThemeColor = "#ef4444"; // Red
        diagHeaderTextColor = "text-red-700";
        diagIcon = <ShieldAlert className="w-8 h-8 text-red-600" strokeWidth={1.5} />;
      } else {
        diagCardStyles = "bg-amber-50 border-amber-100 text-amber-950 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)]";
        diagThemeColor = "#f59e0b"; // Amber
        diagHeaderTextColor = "text-amber-700";
        diagIcon = <AlertCircle className="w-8 h-8 text-amber-600" strokeWidth={1.5} />;
      }
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back action */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-[var(--mute)] hover:text-[var(--ink)] transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Scans
      </button>

      {/* Page Header */}
      <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black text-[var(--ink)] tracking-tight">
                {bpLabel} Analysis
              </h1>
              <Badge variant={statusColors[scan.status] || "default"}>
                {scan.status?.toUpperCase()}
              </Badge>
            </div>
            <div className="mt-2 space-y-1 text-sm text-[var(--mute)]">
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-[var(--ash)]">Patient:</span>
                <span className="font-bold text-[var(--ink-soft)]">
                  {patient?.name || scan.patient_id?.slice(0, 8)}
                </span>
                {patient?.email && <span className="text-[var(--ash)]">({patient.email})</span>}
              </p>
              <p className="font-mono text-xs text-[var(--ash)]">
                Scan ID: {scan.scan_id}
              </p>
            </div>
          </div>
          <div className="text-xs text-[var(--ash)] sm:text-right font-medium">
            Created: {new Date(scan.created_at || Date.now()).toLocaleDateString(undefined, {
              dateStyle: "medium"
            })}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Left Column: Media & Controls (7 Cols on desktop) ── */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* X-Ray Image Card */}
          <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-[var(--mute)] uppercase tracking-wider">
                X-Ray Image File
              </h2>
              {scan.image_path && (
                <button
                  onClick={() => setZoomImage(!zoomImage)}
                  className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline font-bold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {zoomImage ? "Standard view" : "Expand image"}
                </button>
              )}
            </div>

            {scan.image_path ? (
              <div className="space-y-4">
                <div className="relative group bg-slate-900 rounded-[12px] overflow-hidden flex items-center justify-center border border-[var(--hairline)] transition-all">
                  <AuthImage
                    src={scanImageUrl(scan.scan_id)}
                    alt={`${bpLabel} X-ray`}
                    className={`w-full object-contain ${
                      zoomImage ? "max-h-[75vh]" : "max-h-[380px]"
                    } bg-slate-950 transition-all`}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 text-[var(--ink)] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5" /> Preview Mode
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[var(--surface-soft)] p-3 rounded-[12px] border border-[var(--hairline-soft)]">
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--ash)] font-medium">Internal Storage Path</p>
                    <p className="text-xs text-[var(--mute)] font-mono truncate break-all">{scan.image_path}</p>
                  </div>
                  <Badge variant="success">READY</Badge>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[var(--hairline)] hover:border-[var(--primary)] rounded-[16px] p-12 flex flex-col items-center gap-4 cursor-pointer bg-[var(--surface-soft)] hover:bg-[var(--canvas)] transition-all group"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.dicom"
                  onChange={handleUpload}
                  className="hidden"
                />
                <div className="p-4 bg-[var(--surface-card)] group-hover:bg-[var(--canvas)] rounded-full border border-[var(--hairline)] transition-colors">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-[var(--ash)] group-hover:text-[var(--primary)] transition-colors" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[var(--ink)]">
                    {uploading ? "Uploading X-Ray..." : "Select chest or body part X-ray"}
                  </p>
                  <p className="text-xs text-[var(--ash)] mt-1">
                    Supports high-resolution PNG, JPG, or DICOM files
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Run Analysis Console */}
          {scan.image_path && (scan.status === "uploaded" || scan.status === "analyzed" || scan.status === "failed") && (
            <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6 space-y-4 shadow-sm">
              <div>
                <h2 className="text-xs font-bold text-[var(--mute)] uppercase tracking-wider">
                  AI Diagnostics Console
                </h2>
                <p className="text-xs text-[var(--ash)] mt-0.5">
                  Choose the corresponding organ or skeleton type to load specialized weights
                </p>
              </div>

              <div className="relative">
                <select
                  value={selectedBodyPart}
                  onChange={(e) => setSelectedBodyPart(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--surface-card)] border border-[var(--hairline)] rounded-[12px] text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] font-bold text-[var(--ink-soft)] cursor-pointer"
                >
                  {Object.entries(bodyParts).map(([key, cfg]) => (
                    <option key={key} value={key}>
                      {cfg.label}
                    </option>
                  ))}
                  {Object.keys(bodyParts).length === 0 && (
                    <option value="chest">Chest / Thorax</option>
                  )}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mute)] pointer-events-none" />
              </div>

              {bodyParts[selectedBodyPart]?.description && (
                <p className="text-xs text-[var(--mute)] leading-relaxed bg-[var(--surface-soft)] p-3 rounded-[12px] border border-[var(--hairline-soft)]">
                  <BadgeInfo className="w-3.5 h-3.5 inline mr-1 text-[var(--ash)] align-text-bottom" />
                  {bodyParts[selectedBodyPart].description}
                </p>
              )}

              {bodyParts[selectedBodyPart]?.conditions && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[var(--ash)] tracking-wider">
                    Detectable conditions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bodyParts[selectedBodyPart].conditions.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2.5 py-1 bg-[var(--surface-card)] text-[var(--mute)] font-medium rounded-full border border-[var(--hairline-soft)]"
                      >
                        {c.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-pressed)] text-white rounded-[12px] font-extrabold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_8px_-2px_rgba(230,0,35,0.2)] active:scale-[0.99]"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing scan through AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>
                      {scan.status === "analyzed" ? "Run Re-Analysis" : "Run Complete AI Analysis"}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Right Column: AI Results (5 Cols on desktop) ── */}
        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-xs font-bold text-[var(--mute)] uppercase tracking-wider -mb-2 pl-1">
            Diagnostic Reports
          </h2>

          {ai ? (
            <div className="space-y-6">
              
              {/* Prediction card */}
              <div className={`border rounded-[16px] p-6 relative overflow-hidden transition-all ${diagCardStyles}`}>
                <div className="absolute right-3 top-3 opacity-15">
                  <Brain className="w-20 h-20 text-current" strokeWidth={1} />
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-[14px] shadow-sm">
                    {diagIcon}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${diagHeaderTextColor}`}>
                      {ai.body_part_label || bpLabel} Primary Diagnosis
                    </p>
                    <p className="text-3xl font-black tracking-tight leading-none">
                      {ai.prediction?.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-current/10 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="opacity-75">FINDING CONFIDENCE</span>
                    <span>{Math.round(ai.confidence * 100)}%</span>
                  </div>
                  <div className="h-2.5 bg-white/70 rounded-full overflow-hidden p-0.5 border border-current/5">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${ai.confidence * 100}%`,
                        backgroundColor: diagThemeColor
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Patient summary (Structured JSON) */}
              {ai.patient_summary && (
                typeof ai.patient_summary === "string" ? (
                  <div className="bg-blue-50/50 border border-blue-100/80 rounded-[16px] p-5 shadow-sm">
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-2">Patient Summary</p>
                    <p className="text-sm text-blue-900 leading-relaxed font-medium">{ai.patient_summary}</p>
                  </div>
                ) : (
                  <div className={`rounded-[16px] border shadow-sm overflow-hidden ${
                    ai.patient_summary.urgency === "urgent"
                      ? "bg-red-50/40 border-red-200/60"
                      : ai.patient_summary.urgency === "soon"
                      ? "bg-amber-50/40 border-amber-200/60"
                      : ai.patient_summary.urgency === "watch"
                      ? "bg-blue-50/40 border-blue-200/60"
                      : "bg-emerald-50/40 border-emerald-200/60"
                  }`}>
                    {/* Left Accent Bar */}
                    <div className="flex">
                      <div className={`w-1.5 shrink-0 ${
                        ai.patient_summary.urgency === "urgent"
                          ? "bg-red-500"
                          : ai.patient_summary.urgency === "soon"
                          ? "bg-amber-500"
                          : ai.patient_summary.urgency === "watch"
                          ? "bg-blue-500"
                          : "bg-emerald-500"
                      }`} />
                      <div className="p-6 space-y-4 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{ai.patient_summary.emoji}</span>
                          <h3 className={`text-lg font-extrabold tracking-tight ${
                            ai.patient_summary.urgency === "urgent"
                              ? "text-red-950"
                              : ai.patient_summary.urgency === "soon"
                              ? "text-amber-950"
                              : ai.patient_summary.urgency === "watch"
                              ? "text-blue-950"
                              : "text-emerald-950"
                          }`}>
                            {ai.patient_summary.headline}
                          </h3>
                        </div>

                        <div className="space-y-4 text-sm leading-relaxed text-[var(--body)]">
                          <div className="p-3 bg-white/60 rounded-[12px] border border-current/5">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--mute)] block">
                              What the AI detected:
                            </span>
                            <p className="mt-1 font-medium text-[var(--ink-soft)]">
                              {ai.patient_summary.what_found}
                            </p>
                          </div>

                          {ai.patient_summary.what_it_means && (
                            <div>
                              <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--mute)] block">
                                What this means for you:
                              </span>
                              <p className="mt-0.5 text-[var(--body)]">
                                {ai.patient_summary.what_it_means}
                              </p>
                            </div>
                          )}

                          {ai.patient_summary.what_to_do && (
                            <div className={`p-3.5 rounded-[12px] border ${
                              ai.patient_summary.urgency === "urgent"
                                ? "bg-red-100/50 border-red-200 text-red-950"
                                : ai.patient_summary.urgency === "soon"
                                ? "bg-amber-100/50 border-amber-200 text-amber-950"
                                : ai.patient_summary.urgency === "watch"
                                ? "bg-blue-100/50 border-blue-200 text-blue-950"
                                : "bg-emerald-100/50 border-emerald-200 text-emerald-950"
                            }`}>
                              <span className="font-extrabold text-[10px] uppercase tracking-wider opacity-85 block">
                                Recommended Next Action:
                              </span>
                              <p className="mt-1 font-bold">
                                {ai.patient_summary.what_to_do}
                              </p>
                            </div>
                          )}

                          {ai.patient_summary.confidence_text && (
                            <p className="text-xs italic text-[var(--mute)] pt-2.5 border-t border-[var(--hairline)]/50">
                              {ai.patient_summary.confidence_text}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Probabilities breakdown */}
              {ai.probabilities && Object.keys(ai.probabilities).length > 0 && (
                <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-5 shadow-sm space-y-4">
                  <p className="text-xs font-bold text-[var(--mute)] uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--primary)]" />
                    Condition Probabilities Breakdown
                  </p>
                  <div className="space-y-3.5">
                    {Object.entries(ai.probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([condition, prob]) => {
                        const isWinning = condition === ai.prediction;
                        return (
                          <div key={condition} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className={isWinning ? "text-[var(--ink)] font-extrabold" : "text-[var(--mute)]"}>
                                {condition.replace(/_/g, " ")}
                              </span>
                              <span className="font-mono text-[var(--mute)]">{Math.round(prob * 100)}%</span>
                            </div>
                            <div className="h-2 bg-[var(--surface-card)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                  width: `${prob * 100}%`,
                                  backgroundColor: isWinning ? diagThemeColor : "#cbd5e1"
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Clinical Notes (Radiology Interpretation Format) */}
              {ai.rag_explanation && (
                <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] overflow-hidden shadow-sm">
                  <div className="bg-[var(--surface-card)] px-5 py-3 border-b border-[var(--hairline)] flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--mute)] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[var(--ash)]" />
                      Radiology Clinical Interpretation
                    </span>
                    <span className="text-[10px] font-mono text-[var(--ash)]">RECONSTRUCTED BY GROQ</span>
                  </div>
                  <div className="p-5 bg-amber-50/5 font-serif text-sm leading-relaxed text-[var(--ink-soft)] whitespace-pre-line">
                    {ai.rag_explanation}
                  </div>
                </div>
              )}

              {/* Grad-CAM heatmap */}
              {ai.gradcam_path && (
                <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-[var(--mute)] uppercase tracking-wider">
                      Grad-CAM Heatmap Localization
                    </span>
                  </div>
                  <div className="bg-slate-900 rounded-[12px] overflow-hidden flex items-center justify-center border border-[var(--hairline)]">
                    <AuthImage
                      src={gradcamUrl(scan.scan_id)}
                      alt="Grad-CAM heatmap"
                      className="w-full object-contain max-h-[300px] bg-slate-950"
                    />
                  </div>
                  <p className="text-xs text-[var(--ash)] text-center font-medium">
                    AI Attention Map — Red/orange highlights specify regions driving the diagnosis
                  </p>
                </div>
              )}
            </div>
          ) : scan.status === "processing" ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] gap-4 shadow-sm">
              <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
              <div className="text-center">
                <p className="font-bold text-[var(--ink)]">AI Diagnostic execution running...</p>
                <p className="text-xs text-[var(--ash)] mt-1">Analyzing tissue structures and computing probabilities</p>
              </div>
            </div>
          ) : scan.status === "failed" ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] gap-4 shadow-sm">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <div className="text-center">
                <p className="font-bold text-[var(--ink)] text-red-600">Analysis calculation failed</p>
                <button
                  onClick={handleAnalyze}
                  className="mt-3 text-xs bg-[var(--primary)] hover:bg-[var(--primary-pressed)] text-white px-4 py-2 font-bold rounded-lg transition-colors"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] text-center p-6 shadow-sm">
              <div className="p-3 bg-[var(--surface-soft)] rounded-full border border-[var(--hairline)] mb-4">
                <CheckCircle className="w-8 h-8 text-[var(--ash)]" />
              </div>
              <p className="font-bold text-[var(--ink)]">No AI Diagnosis Loaded</p>
              <p className="text-xs text-[var(--ash)] max-w-xs mx-auto mt-1 leading-relaxed">
                Ensure a high-fidelity image is uploaded and execute the analysis console.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
