import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { NotificationItem } from '../../models/studyflow.model';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-notifications-page',
  imports: [CommonModule],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.css',
})
export class NotificationsPageComponent implements OnInit {
  notifications: NotificationItem[] = [];
  userId = '';
  successMsg = '';

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    this.studyflow.bootstrap().subscribe((user) => {
      this.userId = user.id;
      this.load();
    });
  }

  load(): void {
    this.studyflow.notifications(this.userId).subscribe((n) => (this.notifications = n));
  }

  get unreadCount(): number { return this.notifications.filter((n) => !n.is_read).length; }

  markRead(n: NotificationItem): void {
    this.studyflow.markNotificationRead(this.userId, n.id).subscribe({
      next: () => { n.is_read = true; },
    });
  }

  markAllRead(): void {
    const unread = this.notifications.filter((n) => !n.is_read);
    unread.forEach((n) => {
      this.studyflow.markNotificationRead(this.userId, n.id).subscribe({ next: () => { n.is_read = true; } });
    });
    this.successMsg = 'Toutes les notifications marquées comme lues.';
    setTimeout(() => (this.successMsg = ''), 3000);
  }

  iconBg(type: string): string {
    const m: Record<string, string> = {
      session_reminder: 'var(--amber-dim)',
      group_invitation: 'rgba(139,108,247,0.12)',
      goal_achieved: 'var(--green-dim)',
      session_comment: 'var(--dark-4)',
      group_session_created: 'var(--accent-dim)',
    };
    return m[type] ?? 'var(--dark-4)';
  }

  iconColor(type: string): string {
    const m: Record<string, string> = {
      session_reminder: 'var(--amber)',
      group_invitation: '#8b6cf7',
      goal_achieved: 'var(--green)',
      session_comment: 'var(--text-3)',
      group_session_created: 'var(--accent)',
    };
    return m[type] ?? 'var(--text-3)';
  }

  typeBadge(type: string): string {
    const m: Record<string, string> = {
      session_reminder: 't-reminder',
      group_invitation: 't-invite',
      goal_achieved: 't-goal',
      session_comment: 't-comment',
    };
    return m[type] ?? 't-default';
  }

  typeLabel(type: string): string {
    const m: Record<string, string> = {
      session_reminder: 'Rappel',
      group_invitation: 'Invitation',
      goal_achieved: 'Objectif',
      session_comment: 'Commentaire',
      group_session_created: 'Session groupe',
      weekly_report: 'Rapport',
    };
    return m[type] ?? type;
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
}
