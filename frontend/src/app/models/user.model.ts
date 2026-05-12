export type UserStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'banned';

export interface StudyUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  role: 'user' | 'admin';
  status: UserStatus;
  xp_points: number;
  level: number;
  streak_days: number;
  weekly_goal_hours: number | string;
  timezone: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  status: UserStatus;
  xp_points: number;
  level: number;
  streak_days: number;
  weekly_goal_hours: number;
  avatar_url?: string;
}

export type UpdateUserPayload =
  Partial<CreateUserPayload>;
