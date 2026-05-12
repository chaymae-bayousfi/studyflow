import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { StudyUser } from '../../models/user.model';
import {
  AnalyticsDashboard,
  Availability,
  DayOfWeek,
  GroupMessage,
  NotificationItem,
  Priority,
  StudyGroup,
  StudySession,
  Subject,
  SubjectGoal,
  SubjectPoint,
  WeeklyPoint,
} from '../../models/studyflow.model';
import { StudyflowService } from '../../services/studyflow';

type Section =
  | 'dashboard'
  | 'planning'
  | 'productivity'
  | 'goals'
  | 'groups'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'settings';

@Component({
  selector: 'app-study-space',
  imports: [CommonModule, FormsModule],
  templateUrl: './study-space.html',
  styleUrl: './study-space.css',
})
export class StudySpaceComponent implements OnInit {
  section: Section = 'dashboard';
  currentUser: StudyUser | null = null;
  users: StudyUser[] = [];
  subjects: Subject[] = [];
  availabilities: Availability[] = [];
  sessions: StudySession[] = [];
  goals: SubjectGoal[] = [];
  groups: StudyGroup[] = [];
  notifications: NotificationItem[] = [];
  messages: GroupMessage[] = [];
  weekly: WeeklyPoint[] = [];
  subjectStats: SubjectPoint[] = [];
  analytics: AnalyticsDashboard = {
    totalSessions: 0,
    completedSessions: 0,
    totalStudyHours: 0,
    averageProductivity: 0,
  };

  selectedGroupId = '';
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  subjectForm: { name: string; description: string; color: string; priority: Priority } = {
    name: '',
    description: '',
    color: '#4f8ef7',
    priority: 'medium',
  };
  availabilityForm: { day: DayOfWeek; start_time: string; end_time: string } = {
    day: 'monday',
    start_time: '08:00:00',
    end_time: '10:00:00',
  };
  sessionForm = {
    title: '',
    subject_id: '',
    planned_start: '',
    planned_end: '',
    priority: 'medium' as Priority,
    is_online: false,
    meeting_url: '',
  };
  goalForm = { subject_id: '', week_start: this.weekStart(), target_hours: 8 };
  groupForm = { name: '', description: '', subject_id: '', is_public: true };
  inviteEmail = '';
  messageText = '';
  profileForm = { first_name: '', last_name: '', email: '', weekly_goal_hours: 10 };
  settingsForm = { reminderTitle: 'Rappel session', reminderBody: 'Ta prochaine session commence bientôt.' };

  constructor(
    private route: ActivatedRoute,
    private studyflow: StudyflowService,
  ) {}

  ngOnInit(): void {
    window.setTimeout(() => {
      if (this.loading) {
        this.fail('Le backend ne répond pas depuis le navigateur. Vérifie NestJS sur localhost:3000 et le proxy /backend.');
      }
    }, 10000);

    this.route.data.subscribe((data) => {
      this.section = (data['section'] || 'dashboard') as Section;
    });

    this.studyflow.getAllUsers().subscribe((users) => {
      this.users = users;
    });

    this.studyflow.bootstrap().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.profileForm = {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          weekly_goal_hours: Number(user.weekly_goal_hours),
        };
        this.reload();
      },
      error: () => this.fail('Impossible de charger un utilisateur de démonstration.'),
    });
  }

  reload(): void {
    if (!this.currentUser) return;
    this.loading = true;
    this.clearMessages();

    this.studyflow.overview(this.currentUser.id).subscribe({
      next: (data) => {
        this.currentUser = data.user;
        this.subjects = data.subjects;
        this.availabilities = data.availabilities;
        this.sessions = data.sessions;
        this.goals = data.goals;
        this.groups = data.groups;
        this.notifications = data.notifications;
        if (data.analytics) {
          this.analytics = data.analytics.dashboard;
          this.weekly = data.analytics.weekly;
          this.subjectStats = data.analytics.subjects;
        }
        if (!this.selectedGroupId && this.groups.length) {
          this.selectedGroupId = this.groups[0].id;
          this.loadMessages();
        }
        this.loading = false;
      },
      error: () => this.fail('Impossible de charger les données StudyFlow.'),
    });
  }

  switchUser(userId: string): void {
    this.studyflow.setCurrentUser(userId);
    this.studyflow.getUser(userId).subscribe((user) => {
      this.currentUser = user;
      this.selectedGroupId = '';
      this.reload();
    });
  }

  createSubject(): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.createSubject(this.currentUser.id, this.subjectForm), 'Matière créée.');
    this.subjectForm = { name: '', description: '', color: '#4f8ef7', priority: 'medium' };
  }

  deleteSubject(id: string): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.deleteSubject(this.currentUser.id, id), 'Matière supprimée.');
  }

  createAvailability(): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.createAvailability(this.currentUser.id, this.availabilityForm), 'Disponibilité ajoutée.');
  }

  deleteAvailability(id: string): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.deleteAvailability(this.currentUser.id, id), 'Disponibilité supprimée.');
  }

  createSession(): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.createSession(this.currentUser.id, this.sessionForm), 'Session créée.');
    this.sessionForm.title = '';
  }

  completeSession(session: StudySession, rating = 4): void {
    if (!this.currentUser) return;
    this.wrap(
      this.studyflow.updateSession(this.currentUser.id, session.id, {
        status: 'completed',
        productivity_rating: rating,
      }),
      'Session marquée comme réalisée.',
    );
  }

  deleteSession(id: string): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.deleteSession(this.currentUser.id, id), 'Session supprimée.');
  }

  generatePlanning(): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.generateSchedule(this.currentUser.id, this.weekStart()), 'Planning généré automatiquement.');
  }

  createGoal(): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.createGoal(this.currentUser.id, this.goalForm), 'Objectif créé.');
  }

  createGroup(): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.createGroup(this.currentUser.id, this.groupForm), 'Groupe créé.');
    this.groupForm.name = '';
  }

  joinGroup(groupId: string): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.joinGroup(this.currentUser.id, groupId), 'Groupe rejoint.');
  }

  inviteUser(): void {
    if (!this.currentUser || !this.selectedGroupId) return;
    this.wrap(this.studyflow.inviteUser(this.currentUser.id, this.selectedGroupId, this.inviteEmail), 'Invitation envoyée.');
    this.inviteEmail = '';
  }

  loadMessages(): void {
    if (!this.selectedGroupId) return;
    this.studyflow.messages(this.selectedGroupId).subscribe({
      next: (messages) => (this.messages = messages),
      error: () => this.fail('Impossible de charger les messages.'),
    });
  }

  sendMessage(): void {
    if (!this.currentUser || !this.selectedGroupId || !this.messageText.trim()) return;
    this.studyflow.sendMessage(this.currentUser.id, this.selectedGroupId, this.messageText).subscribe({
      next: () => {
        this.messageText = '';
        this.loadMessages();
      },
      error: () => this.fail('Message non envoyé. Tu dois être membre du groupe.'),
    });
  }

  markRead(notification: NotificationItem): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.markNotificationRead(this.currentUser.id, notification.id), 'Notification lue.');
  }

  saveProfile(): void {
    if (!this.currentUser) return;
    this.wrap(this.studyflow.updateUser(this.currentUser.id, this.profileForm), 'Profil mis à jour.');
  }

  createReminder(): void {
    if (!this.currentUser) return;
    this.wrap(
      this.studyflow.createNotification(this.currentUser.id, {
        type: 'session_reminder',
        title: this.settingsForm.reminderTitle,
        body: this.settingsForm.reminderBody,
      }),
      'Notification de rappel créée.',
    );
  }

  get plannedCount(): number {
    return this.sessions.filter((session) => session.status === 'planned').length;
  }

  get completedCount(): number {
    return this.sessions.filter((session) => session.status === 'completed').length;
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.is_read).length;
  }

  get maxWeeklyHours(): number {
    return Math.max(1, ...this.weekly.map((point) => point.hours));
  }

  progress(goal: SubjectGoal): number {
    return Math.min(100, Math.round((Number(goal.achieved_hours) / Number(goal.target_hours)) * 100));
  }

  initials(user = this.currentUser): string {
    if (!user) return 'SF';
    return `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase();
  }

  formatDateTime(value: string): string {
    return new Date(value).toLocaleString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private wrap(request: { subscribe: Function }, message: string): void {
    this.saving = true;
    this.clearMessages();
    request.subscribe({
      next: () => {
        this.successMessage = message;
        this.saving = false;
        this.reload();
      },
      error: () => {
        this.saving = false;
        this.fail('Action impossible. Vérifie les champs ou les contraintes métier.');
      },
    });
  }

  private fail(message: string): void {
    this.errorMessage = message;
    this.loading = false;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private weekStart(): string {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().slice(0, 10);
  }
}
