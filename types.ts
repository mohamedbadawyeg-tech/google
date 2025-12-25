
export type TimeSlot = 
  | 'morning-fasting' 
  | 'after-breakfast' 
  | 'before-lunch' 
  | 'after-lunch' 
  | 'afternoon' 
  | '6pm' 
  | 'after-dinner' 
  | 'before-bed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timeSlot: TimeSlot;
  notes: string;
  isCritical: boolean;
  frequencyLabel: string;
  category?: 'pressure' | 'diabetes' | 'blood-thinner' | 'antibiotic' | 'stomach' | 'other';
}

export interface HealthReport {
  date: string;
  healthRating: number;
  painLevel: number;
  painLocation: string;
  sleepQuality: 'good' | 'fair' | 'poor' | '';
  appetite: 'good' | 'fair' | 'poor' | '';
  symptoms: string[];
  notes: string;
}

export interface AppState {
  patientName: string;
  patientAge: number;
  patientId: string;
  caregiverMode: boolean;
  caregiverTargetId: string | null;
  takenMedications: Record<string, boolean>;
  notificationsEnabled: boolean;
  sentNotifications: string[];
  customReminderTimes: Record<string, string>;
  medicationCustomizations: Record<string, { icon?: string }>; // تخزين الأيقونات المخصصة (اسم الأيقونة أو Base64)
  history: Array<{
    date: string;
    action: string;
    details: string;
    timestamp: string;
  }>;
  dailyReports: Record<string, HealthReport>;
  currentReport: HealthReport;
}

export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  warnings: string[];
  positivePoints: string[];
}
