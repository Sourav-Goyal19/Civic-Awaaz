import axios from "axios";
import type { Complaint, User, Assignment, ComplaintStats } from "@/types.ts";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const complaintsApi = {
  getAll: async (): Promise<Complaint[]> => {
    const response = await api.get("/complaints");
    return response.data.complaints;
  },

  getStats: async (): Promise<ComplaintStats> => {
    const response = await api.get("/complaints/stats");
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Complaint> => {
    const response = await api.patch(`/complaints/${id}`, { status });
    return response.data;
  },
};

export const officersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get("/officers");
    return response.data.officers;
  },
};

export const assignmentsApi = {
  create: async (data: {
    complaintId: string;
    officerId: string;
    assignedBy: string | undefined;
  }): Promise<Assignment> => {
    const response = await api.post("/assignments", data);
    return response.data.assignment;
  },
};
