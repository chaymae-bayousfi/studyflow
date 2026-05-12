import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StudyUser } from '../../models/user.model';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePageComponent implements OnInit {
  currentUser: StudyUser | null = null;
  saving = false;
  successMsg = '';
  errorMsg = '';

  form = {
    first_name: '',
    last_name: '',
    email: '',
    weekly_goal_hours: 10,
  };

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    this.studyflow.bootstrap().subscribe((user) => {
      this.currentUser = user;
      this.patchForm(user);
    });
  }

  private patchForm(user: StudyUser): void {
    this.form = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      weekly_goal_hours: Number(user.weekly_goal_hours),
    };
  }

  save(): void {
    if (!this.currentUser) return;
    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.studyflow.updateUser(this.currentUser.id, this.form).subscribe({
      next: (updated) => {
        this.currentUser = updated;
        this.patchForm(updated);
        this.saving = false;
        this.successMsg = 'Profil mis à jour avec succès.';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: () => {
        this.saving = false;
        this.errorMsg = 'Impossible de mettre à jour le profil.';
      },
    });
  }

  get initials(): string {
    if (!this.currentUser) return 'SF';
    return `${this.currentUser.first_name[0] || ''}${this.currentUser.last_name[0] || ''}`.toUpperCase();
  }

  get xpPercent(): number {
    if (!this.currentUser) return 0;
    const base = (this.currentUser.level - 1) * 500;
    const cap = this.currentUser.level * 500;
    const val = Math.min(this.currentUser.xp_points, cap);
    return Math.round(((val - base) / (cap - base)) * 100);
  }

  get nextLevelXp(): number {
    if (!this.currentUser) return 500;
    return this.currentUser.level * 500;
  }
}
