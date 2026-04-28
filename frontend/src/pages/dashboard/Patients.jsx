import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { listPatients, createPatient, deletePatient } from "../../api/patients";
import { Users, Plus, Trash2, Eye, Search } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", gender: "M", contact: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    try {
      const data = await listPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await createPatient({ ...form, age: parseInt(form.age, 10) });
      setShowCreate(false);
      setForm({ name: "", age: "", gender: "M", contact: "" });
      toast.success("Patient created successfully");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (patientId) => {
    try {
      await deletePatient(patientId);
      toast.success("Patient deleted successfully");
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err.message || "Failed to delete patient");
    }
  };

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_id?.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Loading patients..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Patients</h1>
          <p className="text-gray-400 mt-1">{patients.length} patient{patients.length !== 1 ? "s" : ""} in your tenant.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients found"
          description={search ? "Try a different search term." : "Add your first patient to get started."}
          action={
            !search && (
              <button onClick={() => setShowCreate(true)} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">
                Add Patient
              </button>
            )
          }
        />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <div key={p.patient_id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {p.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.age}y / {p.gender} &middot; ID: {p.patient_id?.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="info">{p.gender}</Badge>
                  <button onClick={() => navigate(`/dashboard/patients/${p.patient_id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(p.patient_id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Patient">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input required type="number" min="0" max="150" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white">
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400" placeholder="+91 9876543210" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={creating} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              {creating ? "Creating..." : "Create Patient"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Delete Patient"
        message="This will permanently delete the patient and all associated records. This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
