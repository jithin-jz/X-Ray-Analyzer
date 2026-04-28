import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
