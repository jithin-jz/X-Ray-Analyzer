import { useState, useEffect } from "react";
import { listAllUsers } from "../../api/users";
import { Users } from "lucide-react";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listAllUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-32"><LoadingSpinner size="lg" text="Loading users..." /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">All Platform Users</h1>
        <p className="text-gray-400 mt-1">{users.length} user{users.length !== 1 ? "s" : ""} across all tenants.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
        {users.map((u) => (
          <div key={u.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-xs">
                {u.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{u.email}</p>
                <p className="text-xs text-gray-400 font-mono">{u.hospital_id ? `Tenant: ${u.hospital_id?.slice(0, 8)}` : "No tenant"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={u.role === "superadmin" ? "purple" : u.role === "admin" ? "info" : "default"}>{u.role}</Badge>
              <Badge variant={u.is_verified ? "success" : "warning"}>{u.is_verified ? "Verified" : "Pending"}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
