import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { StudyUser } from '../../models/user.model';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit {
  users: StudyUser[] = [];
  currentUserId = '';
  userName = '';
  unreadCount = 0;
  todayLabel = '';

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    const now = new Date();
    this.todayLabel = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    this.studyflow.getAllUsers().subscribe((users) => {
      this.users = users;
    });

    this.studyflow.bootstrap().subscribe((user) => {
      this.currentUserId = user.id;
      this.userName = user.first_name;
      this.loadUnread(user.id);
    });
  }

  onSwitchUser(userId: string): void {
    this.studyflow.setCurrentUser(userId);
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.userName = user.first_name;
      this.currentUserId = userId;
      this.loadUnread(userId);
    }
    window.location.reload();
  }

  private loadUnread(userId: string): void {
    this.studyflow.notifications(userId).subscribe({
      next: (notifs) => {
        this.unreadCount = notifs.filter((n) => !n.is_read).length;
      },
    });
  }
}
