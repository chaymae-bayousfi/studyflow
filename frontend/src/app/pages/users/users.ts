import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  CreateUserPayload,
  StudyUser,
  UserStatus,
} from '../../models/user.model';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersComponent implements OnInit {
  users: StudyUser[] = [];
  filteredUsers: StudyUser[] = [];
  selectedUser: StudyUser | null = null;

  searchTerm = '';
  statusFilter: 'all' | UserStatus = 'all';
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  form: CreateUserPayload = this.getEmptyForm();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          'Impossible de charger les utilisateurs. Vérifie que le backend NestJS est démarré sur le port 3000.';
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    const term =
      this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter(
      (user) => {
        const fullName =
          `${user.first_name} ${user.last_name}`.toLowerCase();
        const matchesText =
          !term ||
          fullName.includes(term) ||
          user.email.toLowerCase().includes(term);
        const matchesStatus =
          this.statusFilter === 'all' ||
          user.status === this.statusFilter;

        return matchesText && matchesStatus;
      },
    );
  }

  editUser(user: StudyUser): void {
    this.selectedUser = user;
    this.form = {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '',
      status: user.status,
      xp_points: user.xp_points,
      level: user.level,
      streak_days: user.streak_days,
      weekly_goal_hours: Number(
        user.weekly_goal_hours,
      ),
      avatar_url: user.avatar_url || '',
    };
    this.clearMessages();
  }

  resetForm(): void {
    this.selectedUser = null;
    this.form = this.getEmptyForm();
    this.clearMessages();
  }

  saveUser(): void {
    this.isSaving = true;
    this.clearMessages();

    const payload = {
      ...this.form,
      xp_points: Number(this.form.xp_points),
      level: Number(this.form.level),
      streak_days: Number(this.form.streak_days),
      weekly_goal_hours: Number(
        this.form.weekly_goal_hours,
      ),
    };

    if (this.selectedUser) {
      const { password, ...updatePayload } =
        payload;
      const finalPayload = password
        ? payload
        : updatePayload;

      this.userService
        .updateUser(
          this.selectedUser.id,
          finalPayload,
        )
        .subscribe({
          next: () => this.afterSave('Utilisateur modifié.'),
          error: () => this.handleSaveError(),
        });
      return;
    }

    this.userService.createUser(payload).subscribe({
      next: () => this.afterSave('Utilisateur créé.'),
      error: () => this.handleSaveError(),
    });
  }

  deleteUser(user: StudyUser): void {
    const confirmed = window.confirm(
      `Supprimer ${user.first_name} ${user.last_name} ?`,
    );

    if (!confirmed) {
      return;
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.successMessage =
          'Utilisateur supprimé.';
        this.loadUsers();
      },
      error: () => {
        this.errorMessage =
          'La suppression a échoué.';
      },
    });
  }

  get totalXp(): number {
    return this.users.reduce(
      (sum, user) => sum + user.xp_points,
      0,
    );
  }

  get activeCount(): number {
    return this.users.filter(
      (user) => user.status === 'active',
    ).length;
  }

  get averageLevel(): number {
    if (!this.users.length) {
      return 0;
    }

    const total = this.users.reduce(
      (sum, user) => sum + user.level,
      0,
    );

    return Math.round(total / this.users.length);
  }

  initials(user: StudyUser): string {
    return `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase();
  }

  private afterSave(message: string): void {
    this.successMessage = message;
    this.isSaving = false;
    this.resetForm();
    this.loadUsers();
  }

  private handleSaveError(): void {
    this.errorMessage =
      'Enregistrement impossible. Vérifie les champs et que l’email n’existe pas déjà.';
    this.isSaving = false;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  private getEmptyForm(): CreateUserPayload {
    return {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      status: 'active',
      xp_points: 0,
      level: 1,
      streak_days: 0,
      weekly_goal_hours: 10,
      avatar_url: '',
    };
  }
}
