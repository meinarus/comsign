"use client";

import StudentsTable from "@/components/user/dashboard/students-table";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const { data: session } = authClient.useSession();
  if (!session) return null;

  return (
    <div className="p-4 md:p-6">
      <StudentsTable userId={session.user.id} />
    </div>
  );
}
