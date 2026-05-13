import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { StudyUser } from '../../models/user.model';
import {
  AnalyticsDashboard,
  NotificationItem,
  StudyGroup,
  StudySession,
  SubjectGoal,
  WeeklyPoint,
} from '../../models/studyflow.model';
import { StudyflowService } from '../../services/studyflow';

interface CalCell {
  day: number;
  current: boolean;
  isToday: boolean;
  hasSession: boolean;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  currentUser: StudyUser | null = null;
  sessions: StudySession[] = [];
  goals: SubjectGoal[] = [];
  groups: StudyGroup[] = [];
  notifications: NotificationItem[] = [];
  weekly: WeeklyPoint[] = [];
  analytics: AnalyticsDashboard = {
    totalSessions: 0,
    completedSessions: 0,
    totalStudyHours: 0,
    averageProductivity: 0,
    weeklyStudyHours: 0,
    completionRateDelta: 0
};
  loading = true;

  // Calendar state
  calYear = new Date().getFullYear();
  calMonth = new Date().getMonth();
  dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  calCells: CalCell[] = [];
  todayLabel = '';

  private refreshSub?: Subscription;

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    this.todayLabel = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    this.loadDashboard();

    // Auto-refresh notifications every 60s
    this.refreshSub = interval(60000)
      .pipe(switchMap(() => this.studyflow.bootstrap()))
      .subscribe((user) => {
        if (user) this.loadNotifications(user.id);
      });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  private loadDashboard(): void {
    this.studyflow.bootstrap().subscribe((user) => {
      this.currentUser = user;
      this.studyflow.overview(user.id).subscribe({
        next: (data) => {
          this.currentUser = data.user;
          this.sessions = data.sessions;
          this.goals = data.goals;
          this.groups = data.groups;
          this.notifications = data.notifications;
          if (data.analytics) {
            this.analytics = data.analytics.dashboard;
            this.weekly = data.analytics.weekly;
          }
          this.buildCalendar();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    });
  }

  private loadNotifications(userId: string): void {
    this.studyflow.notifications(userId).subscribe({
      next: (notifs) => (this.notifications = notifs),
    });
  }

  // ── Computed getters ──────────────────────────────────────────────────────

  get completedCount(): number {
    return this.sessions.filter((s) => s.status === 'completed').length;
  }

  get completionRate(): number {
    if (!this.sessions.length) return 0;
    return Math.round((this.completedCount / this.sessions.length) * 100);
  }

  get weeklyProgressPct(): number {
    const goal = Number(this.currentUser?.weekly_goal_hours ?? 10);
    return Math.min(100, Math.round((this.analytics.totalStudyHours / goal) * 100));
  }

  get weeklyHours(): number {
    return parseFloat(this.weekly.reduce((s, p) => s + p.hours, 0).toFixed(1));
  }

  get todaySessions(): number {
    const today = new Date().toDateString();
    return this.sessions.filter(
      (s) => new Date(s.planned_start).toDateString() === today
    ).length;
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.is_read).length;
  }

  get monthLabel(): string {
    return new Date(this.calYear, this.calMonth).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  }

  /** Sessions for today's planning panel */
  get todaySessionList(): StudySession[] {
    const today = new Date().toDateString();
    const todaySess = this.sessions.filter(
      (s) => new Date(s.planned_start).toDateString() === today
    );
    // If no sessions today, show the next 5 upcoming
    if (todaySess.length) return todaySess.slice(0, 5);
    return this.sessions
      .filter((s) => new Date(s.planned_start) >= new Date())
      .slice(0, 5);
  }

  /** Groups the user is a member of (all returned groups) */
  get myGroups(): StudyGroup[] {
    return this.groups.slice(0, 4);
  }

  // ── Calendar ──────────────────────────────────────────────────────────────

  prevMonth(): void {
    if (this.calMonth === 0) {
      this.calMonth = 11;
      this.calYear--;
    } else {
      this.calMonth--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.calMonth === 11) {
      this.calMonth = 0;
      this.calYear++;
    } else {
      this.calMonth++;
    }
    this.buildCalendar();
  }

  private buildCalendar(): void {
    const today = new Date();
    const first = new Date(this.calYear, this.calMonth, 1);
    const last = new Date(this.calYear, this.calMonth + 1, 0);
    const startDow = (first.getDay() + 6) % 7; // Mon=0

    const cells: CalCell[] = [];
    const prevLast = new Date(this.calYear, this.calMonth, 0).getDate();

    for (let i = startDow - 1; i >= 0; i--) {
      cells.push({ day: prevLast - i, current: false, isToday: false, hasSession: false });
    }

    const sessionDates = new Set(
      this.sessions.map(
        (s) =>
          `${new Date(s.planned_start).getDate()}-${new Date(s.planned_start).getMonth()}-${new Date(s.planned_start).getFullYear()}`
      )
    );

    for (let d = 1; d <= last.getDate(); d++) {
      const isToday =
        d === today.getDate() &&
        this.calMonth === today.getMonth() &&
        this.calYear === today.getFullYear();
      const key = `${d}-${this.calMonth}-${this.calYear}`;
      cells.push({ day: d, current: true, isToday, hasSession: sessionDates.has(key) });
    }

    let nd = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ day: nd++, current: false, isToday: false, hasSession: false });
    }

    this.calCells = cells;
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  markAllRead(): void {
    if (!this.currentUser) return;
    const unread = this.notifications.filter((n) => !n.is_read);
    unread.forEach((n) => {
      this.studyflow.markNotificationRead(this.currentUser!.id, n.id).subscribe({
        next: () => (n.is_read = true),
      });
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  goalPct(goal: SubjectGoal): number {
    return Math.min(
      100,
      Math.round((Number(goal.achieved_hours) / Number(goal.target_hours)) * 100)
    );
  }

  barHeight(hours: number): number {
    const max = Math.max(1, ...this.weekly.map((p) => p.hours));
    return Math.round((hours / max) * 100);
  }

  formatTime(val: string): string {
    return new Date(val).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  sessionDuration(s: StudySession): string {
    const mins = Math.round(
      (new Date(s.planned_end).getTime() - new Date(s.planned_start).getTime()) / 60000
    );
    if (mins >= 60) {
      return `${Math.floor(mins / 60)}h${mins % 60 ? (mins % 60) + 'min' : ''}`;
    }
    return `${mins}min`;
  }

  statusChip(status: string): string {
    const map: Record<string, string> = {
      completed: 'chip-done',
      in_progress: 'chip-live',
      planned: 'chip-soon',
      cancelled: 'chip-cancel',
      missed: 'chip-cancel',
    };
    return map[status] ?? 'chip-soon';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      completed: 'Terminé',
      in_progress: 'En cours',
      planned: 'Planifié',
      cancelled: 'Annulé',
      missed: 'Manqué',
    };
    return map[status] ?? status;
  }

  timeAgo(val: string): string {
    const diff = Date.now() - new Date(val).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `Il y a ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Il y a ${h}h`;
    return `Il y a ${Math.floor(h / 24)}j`;
  }

  notifIconBg(type: string): string {
    const map: Record<string, string> = {
      session_reminder: 'var(--amber-dim)',
      group_invitation: 'rgba(139,108,247,0.12)',
      goal_achieved: 'var(--green-dim)',
      session_comment: 'var(--dark-4)',
      group_session_created: 'var(--accent-dim)',
      weekly_report: 'var(--accent-dim)',
    };
    return map[type] ?? 'var(--dark-4)';
  }

  notifIconColor(type: string): string {
    const map: Record<string, string> = {
      session_reminder: 'var(--amber)',
      group_invitation: '#8b6cf7',
      goal_achieved: 'var(--green)',
      session_comment: 'var(--text-3)',
      group_session_created: 'var(--accent)',
      weekly_report: 'var(--accent)',
    };
    return map[type] ?? 'var(--text-3)';
  }

  groupIconColors: string[] = [
    'var(--accent)',
    'var(--green)',
    'var(--amber)',
    'var(--purple, #8b6cf7)',
    'var(--red)',
  ];

  groupBgColors: string[] = [
    'var(--accent-dim)',
    'var(--green-dim)',
    'var(--amber-dim)',
    'rgba(139,108,247,0.12)',
    'var(--red-dim)',
  ];

  groupColor(index: number): string {
    return this.groupIconColors[index % this.groupIconColors.length];
  }

  groupBg(index: number): string {
    return this.groupBgColors[index % this.groupBgColors.length];
  }
}