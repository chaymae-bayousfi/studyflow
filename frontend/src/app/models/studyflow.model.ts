import { StudyUser } from './user.model';

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Subject {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  priority: Priority;
}

export interface Availability {
  id: string;
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface StudySession {
  id: string;
  title: string;
  description?: string;
  status: SessionStatus;
  priority: Priority;
  planned_start: string;
  planned_end: string;
  productivity_rating?: number;
  is_online: boolean;
  meeting_url?: string;
  subjects?: Subject;
  subject_id?: string;
}

export interface SubjectGoal {
  id: string;
  week_start: string;
  target_hours: number | string;
  achieved_hours: number | string;
  is_completed: boolean;
  subjects: Subject;
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  invitation_code?: string;
  is_public: boolean;
  subjects?: Subject;
}

export interface GroupMember {
  id: string;
  role: string;
  users_group_members_user_idTousers: Pick<StudyUser, 'id' | 'first_name' | 'last_name' | 'email'>;
}

export interface GroupMessage {
  id: string;
  content: string;
  created_at: string;
  users: Pick<StudyUser, 'id' | 'first_name' | 'last_name'>;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsDashboard {
  totalSessions: number;
  completedSessions: number;
  totalStudyHours: number;
  averageProductivity: number;
}

export interface WeeklyPoint {
  day: string;
  hours: number;
}

export interface SubjectPoint {
  subject: string;
  hours: number;
}
