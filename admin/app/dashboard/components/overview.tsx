"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { complaintsApi } from "@/lib/api";
import {
  AlertCircle,
  Clock,
  CheckCircle,
  UserCheck,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";

export function OverviewPage() {
  const { data: stats } = useQuery({
    queryKey: ["complaint-stats"],
    queryFn: complaintsApi.getStats,
  });

  const { data: recentComplaints } = useQuery({
    queryKey: ["recent-complaints"],
    queryFn: () =>
      complaintsApi.getAll().then((complaints) => complaints?.slice(0, 5)),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "assigned":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
          >
            <UserCheck className="w-3 h-3 mr-1" />
            Assigned
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground">
          Municipal complaint management dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Complaints
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {stats?.total || 0}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              Pending
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
              {stats?.pending || 0}
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Assigned
            </CardTitle>
            <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats?.assigned || 0}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Resolved
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {stats?.resolved || 0}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>
              Latest complaints submitted by citizens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentComplaints?.map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {complaint.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {complaint.location}
                    </p>
                  </div>
                  <div className="ml-4">{getStatusBadge(complaint.status)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
            >
              <FileText className="mr-2 h-4 w-4" />
              View All Complaints
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Officers
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Priority Complaints
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
