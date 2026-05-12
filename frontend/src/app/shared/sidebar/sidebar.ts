import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { StudyUser } from '../../models/user.model';
import { AuthService } from '../../services/auth';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  currentUser: StudyUser | null = null;
  unreadCount = 0;

  constructor(
    private studyflow: StudyflowService,
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.studyflow.bootstrap().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loadUnread(user.id);
      },
    });
  }

  private loadUnread(userId: string): void {
    this.studyflow.notifications(userId).subscribe({
      next: (notifs) => {
        this.unreadCount = notifs.filter((n) => !n.is_read).length;
      },
    });
  }

  get nextLevelXp(): number {
    return (this.currentUser?.level ?? 1) * 500;
  }

  get xpPercent(): number {
    if (!this.currentUser) return 0;
    const base = (this.currentUser.level - 1) * 500;
    const cap = this.currentUser.level * 500;
    const val = Math.min(this.currentUser.xp_points, cap);
    return Math.round(((val - base) / (cap - base)) * 100);
  }

  initials(): string {
    if (!this.currentUser) return 'SF';
    return `${this.currentUser.first_name[0] || ''}${this.currentUser.last_name[0] || ''}`.toUpperCase();
  }

  logout(): void {
    this.auth.logout().subscribe({
      complete: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
