// components/dashboard-stats.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { listAttendance } from "@/actions/attendance";
import { listStudents } from "@/actions/student";

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export function DashboardStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<{
    totalStudents: number;
    todaysAttendance: number;
    timeInCount: number;
    timeOutCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, { start, end }] = await Promise.all([
          listStudents(userId),
          getTodayRange(),
        ]);

        if (studentsRes.error) throw new Error(studentsRes.error);

        const attendanceRes = await listAttendance(
          userId,
          "createdAt",
          start.toISOString(),
          end.toISOString(),
        );

        if (attendanceRes.error) throw new Error(attendanceRes.error);

        const totalStudents = studentsRes.data?.length || 0;
        const todaysRecords = attendanceRes.data || [];

        setStats({
          totalStudents,
          todaysAttendance: todaysRecords.length,
          timeInCount: todaysRecords.filter((r) => r.timeIn).length,
          timeOutCount: todaysRecords.filter((r) => r.timeOut).length,
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
  }, [userId]);

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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Students Card */}
      <Card className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Total Students</h3>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {stats?.totalStudents.toLocaleString()}
            </div>
          )}
          <p className="text-muted-foreground text-sm">Registered students</p>
        </div>
      </Card>

      {/* Today's Attendance Card */}
      <Card className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Today&apos;s Attendance</h3>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {stats?.todaysAttendance.toLocaleString()}
              <span className="text-muted-foreground ml-2 text-sm">
                (
                {calculatePercentage(
                  stats?.todaysAttendance ?? 0,
                  stats?.totalStudents ?? 0,
                )}
                )
              </span>
            </div>
          )}
          <p className="text-muted-foreground text-sm">
            Today&apos;s attendance rate
          </p>
        </div>
      </Card>

      {/* Today's Time In Card */}
      <Card className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Time In Today</h3>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {stats?.timeInCount.toLocaleString()}
              <span className="text-muted-foreground ml-2 text-sm">
                (
                {calculatePercentage(
                  stats?.timeInCount ?? 0,
                  stats?.totalStudents ?? 0,
                )}
                )
              </span>
            </div>
          )}
          <p className="text-muted-foreground text-sm">Checked in today</p>
        </div>
      </Card>

      {/* Today's Time Out Card */}
      <Card className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold">Time Out Today</h3>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {stats?.timeOutCount.toLocaleString()}
              <span className="text-muted-foreground ml-2 text-sm">
                (
                {calculatePercentage(
                  stats?.timeOutCount ?? 0,
                  stats?.totalStudents ?? 0,
                )}
                )
              </span>
            </div>
          )}
          <p className="text-muted-foreground text-sm">Checked out today</p>
        </div>
      </Card>
    </div>
  );
}
