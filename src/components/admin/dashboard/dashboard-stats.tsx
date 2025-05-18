"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { User } from "@/types/user";

export function AdminDashboardStats() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    verifiedUsers: number;
    adminUsers: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authClient.admin.listUsers({
          query: {
            sortBy: "createdAt",
            sortDirection: "asc",
          },
        });

        if (!response?.data) throw new Error("Failed to fetch users");

        const users = response.data.users as User[];

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((user) => !user.banned).length,
          bannedUsers: users.filter((user) => user.banned).length,
          verifiedUsers: users.filter((user) => user.emailVerified).length,
          adminUsers: users.filter((user) => user.role === "admin").length,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load statistics",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="text-destructive p-4 text-center">
        Error loading statistics: {error}
      </div>
    );
  }

  const calculatePercentage = (
    numerator: number,
    denominator: number,
  ): string => {
    if (denominator === 0) return "0%";
    return `${Math.round((numerator / denominator) * 100)}%`;
  };

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Total Users</h3>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {stats?.totalUsers.toLocaleString()}
            </div>
          )}
          <p className="text-muted-foreground text-sm">Registered users</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Active Users</h3>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {stats?.activeUsers.toLocaleString()}
              <span className="text-muted-foreground ml-2 text-sm">
                (
                {calculatePercentage(
                  stats?.activeUsers ?? 0,
                  stats?.totalUsers ?? 0,
                )}
                )
              </span>
            </div>
          )}
          <p className="text-muted-foreground text-sm">Currently active</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Banned Users</h3>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {stats?.bannedUsers.toLocaleString()}
              <span className="text-muted-foreground ml-2 text-sm">
                (
                {calculatePercentage(
                  stats?.bannedUsers ?? 0,
                  stats?.totalUsers ?? 0,
                )}
                )
              </span>
            </div>
          )}
          <p className="text-muted-foreground text-sm">Suspended accounts</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Verified Users</h3>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {stats?.verifiedUsers.toLocaleString()}
              <span className="text-muted-foreground ml-2 text-sm">
                (
                {calculatePercentage(
                  stats?.verifiedUsers ?? 0,
                  stats?.totalUsers ?? 0,
                )}
                )
              </span>
            </div>
          )}
          <p className="text-muted-foreground text-sm">Email verified</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Admin Users</h3>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {stats?.adminUsers.toLocaleString()}
              <span className="text-muted-foreground ml-2 text-sm">
                (
                {calculatePercentage(
                  stats?.adminUsers ?? 0,
                  stats?.totalUsers ?? 0,
                )}
                )
              </span>
            </div>
          )}
          <p className="text-muted-foreground text-sm">Administrators</p>
        </div>
      </Card>
    </div>
  );
}
