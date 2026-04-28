import { apiFetch } from "./client";

export const listScans = (patientId = null) => {
  const query = patientId ? `?patient_id=${patientId}` : "";
  return apiFetch(`/scans/${query}`);
};

export const getScan = (scanId) => apiFetch(`/scans/${scanId}`);

export const createScan = (data) =>
  apiFetch("/scans/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const uploadScanImage = async (scanId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch(`/scans/${scanId}/upload`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type — browser adds multipart boundary
    headers: {},
  });
};

export const deleteScan = (scanId) =>
  apiFetch(`/scans/${scanId}`, { method: "DELETE" });

export const analyzeScan = (scanId) =>
  apiFetch("/ai/analyze", {
    method: "POST",
    body: JSON.stringify({ scan_id: scanId }),
  });
