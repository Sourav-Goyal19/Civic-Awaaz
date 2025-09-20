"use client";

import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignmentModal } from "./assignment-modal";
import { complaintsApi } from "@/lib/api";
import type { Complaint } from "@/types";
import { UserCheck, AlertCircle, Clock, CheckCircle } from "lucide-react";

export function AdminDashboard() {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const {
    data: complaints,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["complaints"],
    queryFn: complaintsApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ["complaint-stats"],
    queryFn: complaintsApi.getStats,
  });

  const handleAssignClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsAssignModalOpen(true);
  };

  const handleAssignmentSuccess = () => {
    refetch();
    setIsAssignModalOpen(false);
    setSelectedComplaint(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "assigned":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <UserCheck className="w-3 h-3 mr-1" />
            Assigned
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Municipal Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage citizen complaints and officer assignments
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Complaints
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats?.pending || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.assigned || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.resolved || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complaints Management</CardTitle>
            <CardDescription>
              View and assign complaints to officers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints?.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">
                      {complaint.title}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {complaint.description}
                    </TableCell>
                    <TableCell>{complaint.location}</TableCell>
                    <TableCell>{complaint.createdBy?.name}</TableCell>
                    <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                    <TableCell>
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {complaint.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleAssignClick(complaint)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Assign Officer
                        </Button>
                      )}
                      {complaint.status === "assigned" &&
                        complaint.assignment && (
                          <div className="text-sm text-muted-foreground">
                            Assigned to: {complaint.assignment.officer?.name}
                          </div>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AssignmentModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          complaint={selectedComplaint}
          onSuccess={handleAssignmentSuccess}
        />
      </div>
    </div>
  );
}
