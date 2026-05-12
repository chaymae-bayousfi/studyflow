import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StudyUser } from '../../models/user.model';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-settings-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.css',
})
export class SettingsPageComponent implements OnInit {
  currentUser: StudyUser | null = null;
  saving = false;
  successMsg = '';
  errorMsg = '';

  notifForm = {
    title: 'Rappel de session',
    body: 'Ta prochaine session d\'étude commence bientôt. Prépare-toi !',
  };

  prefs = {
    sessionReminders: true,
    goalAlerts: true,
    groupMessages: true,
    weeklyReport: false,
  };

  timezone = 'Africa/Casablanca';

  timezones = [
    'Africa/Casablanca',
    'Europe/Paris',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Asia/Dubai',
  ];

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    this.studyflow.bootstrap().subscribe((user) => {
      this.currentUser = user;
      this.timezone = user.timezone || 'Africa/Casablanca';
    });
  }

  sendTestNotification(): void {
    if (!this.currentUser) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.studyflow.createNotification(this.currentUser.id, {
      type: 'session_reminder',
      title: this.notifForm.title,
      body: this.notifForm.body,
    } as any).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'Notification de test créée avec succès.';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Impossible de créer la notification.';
      },
    });
  }

  saveTimezone(): void {
    if (!this.currentUser) return;
    this.saving = true;
    this.studyflow.updateUser(this.currentUser.id, { timezone: this.timezone } as any).subscribe({
      next: (updated) => {
        this.currentUser = updated;
        this.saving = false;
        this.successMsg = 'Fuseau horaire mis à jour.';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Impossible de mettre à jour le fuseau horaire.';
      },
    });
  }

  get memberSince(): string {
    if (!this.currentUser) return '-';
    return new Date(this.currentUser.created_at).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }
}
