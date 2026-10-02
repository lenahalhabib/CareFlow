export interface Doctor {
  id: string;
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  phone: string;
  hospitalName: string;
  professionalTitle: string;
  licenseNumber: string;
  specialty: string;
  customSpecialty?: string;
  yearsOfExperience: number;
  experienceBio: string;
  certificates: string[];
}

export interface ServicePrice {
  id: string;
  doctorId: string;
  serviceName: string;
  priceSAR: number;
  isActive: boolean;
}

export interface PlanStep {
  id: string;
  treatmentName: string;
  priceSAR: number;
  status: 'Pending' | 'Completed' | 'Removed';
  removedReason?: string;
}

export interface TreatmentDay {
  id: string;
  dayNumber: number;
  date: string;
  status: 'Completed' | 'Today' | 'Scheduled' | 'No_Show' | 'In_Progress';
  steps: PlanStep[];
  gapDaysToNext: number; // AI suggested gap to the *next* day
  notes?: string;
  attachments?: string[];
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  totalCost: number;
  totalDays: number;
  aiGenerated: boolean;
  status: 'Pending_Approval' | 'Approved' | 'Rejected' | 'In_Progress' | 'Completed';
  days: TreatmentDay[];
  rejectionReason?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  planId: string;
  requestedDate: string;
  requestedTime: string;
  status: 'Pending' | 'Approved' | 'Cancelled' | 'Rescheduled' | 'Attended' | 'No_Show';
  cancellationReason?: string;
  doctorSessionNotes?: string;
}