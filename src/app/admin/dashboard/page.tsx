import { AdminDashboardStats } from "@/components/admin/dashboard/dashboard-stats";
import RecentUsers from "@/components/admin/dashboard/recent-users";

export default function Page() {
  return (
    <div className="flex flex-col gap-10 p-4 md:p-6">
      <AdminDashboardStats />

      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold">Recently Created Users</h2>
        <RecentUsers />
      </div>
    </div>
  );
}
