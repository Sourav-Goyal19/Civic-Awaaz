"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { complaintsApi } from "@/lib/api";
import { AssignmentModal } from "../components/assignment-modal";
import type { Complaint } from "@/types";
import { UserCheck, Clock, CheckCircle, Search, Filter } from "lucide-react";
import { userStore } from "@/zustand/store";
import { useRouter } from "next/navigation";

interface ComplaintsPageProps {
  type: "new" | "old";
}

export function ComplaintsPage({ type }: ComplaintsPageProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { user } = userStore();
  const router = useRouter();

  useEffect(() => {
    function checkUser() {
      if (user == null) {
        router.push("/sign-in");
      }
    }

    checkUser();
  }, []);

  const {
    data: complaints,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["complaints", type],
    queryFn: complaintsApi.getAll,
  });

  const filteredComplaints = complaints?.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;

    const matchesType =
      type === "new"
        ? complaint.status === "pending" || complaint.status === "assigned"
        : complaint.status === "resolved";

    return matchesSearch && matchesStatus && matchesType;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {type === "new" ? "New Complaints" : "Old Complaints"}
        </h1>
        <p className="text-muted-foreground">
          {type === "new"
            ? "Manage pending and assigned complaints"
            : "View resolved complaints history"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {type === "new" ? "Active Complaints" : "Resolved Complaints"}
          </CardTitle>
          <CardDescription>
            {filteredComplaints?.length || 0} complaints found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  {/* <TableHead>Submitted By</TableHead> */}
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints?.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">
                      {complaint.title}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={complaint.description}>
                        {complaint.description}
                      </div>
                    </TableCell>
                    <TableCell>{complaint.location}</TableCell>
                    {/* <TableCell>{complaint.createdBy?.name}</TableCell> */}
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
                      {complaint.status === "resolved" && (
                        <Badge variant="outline" className="text-green-600">
                          Completed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        complaint={selectedComplaint}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  );
}
