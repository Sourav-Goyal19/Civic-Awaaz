"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { officersApi, assignmentsApi } from "@/lib/api";
import type { Complaint } from "@/types";
import { toast } from "sonner";
import { userStore } from "@/zustand/store";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint | null;
  onSuccess: () => void;
}

export function AssignmentModal({
  isOpen,
  onClose,
  complaint,
  onSuccess,
}: AssignmentModalProps) {
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const { user } = userStore();
  const { data: officers, isLoading: loadingOfficers } = useQuery({
    queryKey: ["officers"],
    queryFn: officersApi.getAll,
    enabled: isOpen,
  });

  const assignMutation = useMutation({
    mutationFn: assignmentsApi.create,
    onSuccess: () => {
      toast.success("Complaint assigned successfully");
      onSuccess();
      setSelectedOfficerId("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign complaint");
    },
  });

  const handleAssign = () => {
    if (!complaint || !selectedOfficerId) return;

    assignMutation.mutate({
      complaintId: complaint.id,
      officerId: selectedOfficerId,
      assignedBy: user?.id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Complaint to Officer</DialogTitle>
          <DialogDescription>
            Select an officer to assign this complaint to.
          </DialogDescription>
        </DialogHeader>

        {complaint && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Complaint Details</Label>
              <div className="p-3 bg-muted rounded-md">
                <h4 className="font-medium">{complaint.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {complaint.description}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Location:</strong> {complaint.location}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="officer-select">Select Officer</Label>
              <Select
                value={selectedOfficerId}
                onValueChange={setSelectedOfficerId}
                disabled={loadingOfficers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an officer..." />
                </SelectTrigger>
                <SelectContent>
                  {officers?.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.name} ({officer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={assignMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedOfficerId || assignMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {assignMutation.isPending ? "Assigning..." : "Assign Officer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
