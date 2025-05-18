"use client";

import LatestAttendance from "@/components/user/dashboard/latest-attendance";
import { DashboardStats } from "@/components/user/dashboard/dashboard-stats";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const { data: session } = authClient.useSession();

  if (!session) return null;

  return (
    <div className="flex flex-col gap-10 p-4 md:p-6">
      <DashboardStats userId={session.user.id} />

      <div className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold">Latest Attendance Records</h2>
        <LatestAttendance userId={session.user.id} />
      </div>
    </div>
  );
}
