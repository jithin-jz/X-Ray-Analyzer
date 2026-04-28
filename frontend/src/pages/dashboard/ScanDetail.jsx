import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getScan, uploadScanImage, analyzeScan } from "../../api/scans";
import { getPatient } from "../../api/patients";
import { ArrowLeft, Upload, Zap, Loader2, CheckCircle, AlertCircle, Brain, FileImage } from "lucide-react";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function ScanDetail() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [scan, setScan] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const load = async () => {
    try {
      const s = await getScan(scanId);
      setScan(s);
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

  useEffect(() => { load(); }, [scanId]);

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
      await analyzeScan(scanId);
      toast.success("AI analysis complete");
      load();
    } catch (err) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><LoadingSpinner size="lg" text="Loading scan..." /></div>;
  if (!scan) return <div className="text-center py-20 text-gray-500">Scan not found.</div>;

  const statusColors = { uploaded: "info", processing: "warning", analyzed: "success", failed: "danger" };

  return (
    <div className="space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Scan header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{scan.scan_type?.replace("_", " ")} Scan</h1>
            <p className="text-sm text-gray-400">Patient: <span className="font-semibold text-gray-600">{patient?.name || scan.patient_id?.slice(0, 8)}</span></p>
            <p className="text-xs text-gray-300 font-mono mt-2">Scan ID: {scan.scan_id}</p>
          </div>
          <Badge variant={statusColors[scan.status]}>{scan.status?.toUpperCase()}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">X-Ray Image</h2>
          {scan.image_path ? (
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-3">
              <FileImage className="w-16 h-16 text-blue-400" strokeWidth={1} />
              <p className="text-sm text-gray-600 font-mono text-center break-all">{scan.image_path}</p>
              <Badge variant="success">Uploaded</Badge>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-300 transition-colors">
              <input ref={fileRef} type="file" accept="image/*,.dicom" onChange={handleUpload} className="hidden" />
              <Upload className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-gray-400">{uploading ? "Uploading..." : "Click to upload X-ray image"}</p>
            </div>
          )}

          {scan.image_path && scan.status === "uploaded" && (
            <button onClick={handleAnalyze} disabled={analyzing} className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {analyzing ? "Analyzing..." : "Run AI Analysis"}
            </button>
          )}
        </div>

        {/* AI Result section */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">AI Diagnosis</h2>
          {scan.ai_result ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Prediction</p>
                    <p className="text-2xl font-black text-emerald-900">{scan.ai_result.prediction}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Confidence</p>
                    <p className="text-lg font-bold text-gray-900">{Math.round(scan.ai_result.confidence * 100)}%</p>
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${scan.ai_result.confidence * 100}%` }} />
                  </div>
                </div>
              </div>

              {scan.ai_result.rag_explanation && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-2">AI Explanation</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{scan.ai_result.rag_explanation}</p>
                </div>
              )}
            </div>
          ) : scan.status === "processing" ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              <p className="text-gray-400">Analysis in progress...</p>
            </div>
          ) : scan.status === "failed" ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-red-500 font-semibold">Analysis failed</p>
              <button onClick={handleAnalyze} className="text-sm text-blue-600 hover:underline">Retry</button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 gap-4 text-gray-300">
              <CheckCircle className="w-10 h-10" />
              <p className="text-gray-400">Upload an image and run analysis to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
