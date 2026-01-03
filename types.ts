
export enum UserRole {
  CITIZEN = 'Citizen',
  VOLUNTEER = 'Volunteer',
  NGO = 'NGO Coordinator',
  GOVERNMENT = 'Government Official'
}

export enum DisasterStatus {
  REPORTED = 'Reported',
  VERIFIED = 'Verified',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isOnline?: boolean;
}

export interface Disaster {
  id: string;
  type: string;
  description: string;
  location: string;
  severity: Severity;
  status: DisasterStatus;
  reportedBy: string; // User ID
  createdAt: Date;
}

export interface Task {
  id: string;
  disasterId: string;
  ngoId: string;
  volunteerId?: string;
  description: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Rejected';
  createdAt: Date;
}

export interface ResourceRequest {
  id: string;
  ngoId: string;
  type: string;
  quantity: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  description: string;
  createdAt: Date;
}

export interface HelpRequest {
  id: string;
  userId: string;
  type: 'Medical' | 'Food' | 'Rescue' | 'Shelter';
  description: string;
  location: string;
  status: 'Pending' | 'Fulfilled' | 'Rejected';
  createdAt: Date;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: Severity;
  issuer: string; // Gov Official Name
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
}
