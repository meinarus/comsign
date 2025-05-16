import UsersTable from "@/components/admin/dashboard/users-table";

export default async function Page() {
  return (
    <div className="p-4 md:p-6">
      <UsersTable />
    </div>
  );
}
