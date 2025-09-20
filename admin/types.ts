export interface User {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "admin" | "officer";
  createdAt: string;
  assignments: number;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  status: "pending" | "assigned" | "resolved";
  createdBy?: User;
  createdAt: string;
  assignment?: {
    id: string;
    officer?: User;
    assignedBy?: User;
    assignedAt: string;
  };
}

export interface Assignment {
  id: string;
  complaintId: string;
  officerId: string;
  assignedBy: string;
  assignedAt: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  assigned: number;
  resolved: number;
}
