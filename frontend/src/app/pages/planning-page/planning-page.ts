import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StudyUser } from '../../models/user.model';
import { Availability, DayOfWeek, Priority, StudySession, Subject } from '../../models/studyflow.model';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-planning-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './planning-page.html',
  styleUrl: './planning-page.css',
})
export class PlanningPageComponent implements OnInit {
  currentUser: StudyUser | null = null;
  subjects: Subject[] = [];
  availabilities: Availability[] = [];
  sessions: StudySession[] = [];
  saving = false;
  errorMsg = '';
  successMsg = '';

  subjectForm = { name: '', description: '', color: '#4f8ef7', priority: 'medium' as Priority };
  availForm = { day: 'monday' as DayOfWeek, start_time: '08:00', end_time: '10:00' };
  sessionForm = {
    title: '', subject_id: '', planned_start: '', planned_end: '',
    priority: 'medium' as Priority, is_online: false,
  };

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    this.studyflow.bootstrap().subscribe((user) => {
      this.currentUser = user;
      this.load();
    });
  }

  load(): void {
    if (!this.currentUser) return;
    const uid = this.currentUser.id;
    this.studyflow.subjects(uid).subscribe((s) => (this.subjects = s));
    this.studyflow.availabilities(uid).subscribe((a) => (this.availabilities = a));
    this.studyflow.sessions(uid).subscribe((s) => (this.sessions = s));
  }

  createSubject(): void {
    if (!this.currentUser || !this.subjectForm.name) return;
    this.saving = true; this.clearMsgs();
    this.studyflow.createSubject(this.currentUser.id, this.subjectForm).subscribe({
      next: () => { this.ok('Matière créée.'); this.subjectForm = { name: '', description: '', color: '#4f8ef7', priority: 'medium' }; this.load(); },
      error: () => this.err('Impossible de créer la matière.'),
    });
  }

  deleteSubject(id: string): void {
    if (!this.currentUser || !confirm('Supprimer cette matière ?')) return;
    this.studyflow.deleteSubject(this.currentUser.id, id).subscribe({ next: () => this.load() });
  }

  createAvailability(): void {
    if (!this.currentUser) return;
    this.saving = true; this.clearMsgs();
    this.studyflow.createAvailability(this.currentUser.id, this.availForm).subscribe({
      next: () => { this.ok('Disponibilité ajoutée.'); this.load(); },
      error: () => this.err('Impossible d\'ajouter la disponibilité.'),
    });
  }

  deleteAvailability(id: string): void {
    if (!this.currentUser) return;
    this.studyflow.deleteAvailability(this.currentUser.id, id).subscribe({ next: () => this.load() });
  }

  createSession(): void {
    if (!this.currentUser || !this.sessionForm.title || !this.sessionForm.subject_id) return;
    this.saving = true; this.clearMsgs();
    this.studyflow.createSession(this.currentUser.id, this.sessionForm).subscribe({
      next: () => { this.ok('Session créée.'); this.sessionForm.title = ''; this.load(); },
      error: () => this.err('Impossible de créer la session. Vérifiez qu\'il n\'y a pas de chevauchement.'),
    });
  }

  completeSession(s: StudySession): void {
    if (!this.currentUser) return;
    this.studyflow.updateSession(this.currentUser.id, s.id, { status: 'completed', productivity_rating: 4 } as any).subscribe({
      next: () => { this.ok('Session marquée comme réalisée. +XP'); this.load(); },
    });
  }

  deleteSession(id: string): void {
    if (!this.currentUser || !confirm('Supprimer cette session ?')) return;
    this.studyflow.deleteSession(this.currentUser.id, id).subscribe({ next: () => this.load() });
  }

  generatePlanning(): void {
    if (!this.currentUser) return;
    if (this.subjects.length === 0 || this.availabilities.length === 0) {
      this.err('Ajoutez d\'abord des matières et des disponibilités.'); return;
    }
    this.saving = true; this.clearMsgs();
    const weekStart = this.getWeekStart();
    this.studyflow.generateSchedule(this.currentUser.id, weekStart).subscribe({
      next: () => { this.ok('Planning intelligent généré.'); this.load(); },
      error: () => this.err('Erreur lors de la génération. Le planning existe peut-être déjà pour cette semaine.'),
    });
  }

  dayLabel(day: string): string {
    const m: Record<string, string> = { monday: 'Lundi', tuesday: 'Mardi', wednesday: 'Mercredi', thursday: 'Jeudi', friday: 'Vendredi', saturday: 'Samedi', sunday: 'Dimanche' };
    return m[day] ?? day;
  }

  formatDt(val: string): string {
    return new Date(val).toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  statusChip(status: string): string {
    return { completed: 'chip-done', in_progress: 'chip-live', planned: 'chip-soon', cancelled: 'chip-cancel', missed: 'chip-cancel' }[status] ?? 'chip-soon';
  }

  statusLabel(status: string): string {
    return { completed: 'Terminé', in_progress: 'En cours', planned: 'Planifié', cancelled: 'Annulé', missed: 'Manqué' }[status] ?? status;
  }

  private getWeekStart(): string {
    const d = new Date(); const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff); d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  private ok(msg: string): void { this.successMsg = msg; this.saving = false; }
  private err(msg: string): void { this.errorMsg = msg; this.saving = false; }
  private clearMsgs(): void { this.errorMsg = ''; this.successMsg = ''; }
}
