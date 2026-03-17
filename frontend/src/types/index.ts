export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  clinic?: Clinic;
}

export interface Clinic {
  id: string;
  name: string;
  plan: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  condition: string;
  testResult?: string;
  testDate?: string;
  notes?: string;
  counselorId: string;
  familyMembers: FamilyMember[];
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  relationship: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  riskLevel: string;
  testStatus: string;
  testResult?: string;
  testDate?: string;
  outreaches: Outreach[];
  createdAt: string;
}

export interface Outreach {
  id: string;
  familyMemberId: string;
  method: string;
  status: string;
  sentAt?: string;
  respondedAt?: string;
  message?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalAtRisk: number;
  tested: number;
  contacted: number;
  declined: number;
  notContacted: number;
  scheduled: number;
  cascadeRate: number;
  industryBaseline: number;
  conditionBreakdown: { name: string; count: number }[];
  recentOutreaches: (Outreach & { familyMember: FamilyMember & { patient: Patient } })[];
}
