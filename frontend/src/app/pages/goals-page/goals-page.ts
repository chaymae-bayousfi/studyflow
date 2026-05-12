import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Subject, SubjectGoal } from '../../models/studyflow.model';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-goals-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './goals-page.html',
  styleUrl: './goals-page.css',
})
export class GoalsPageComponent implements OnInit {
  subjects: Subject[] = [];
  goals: SubjectGoal[] = [];
  saving = false;
  errorMsg = '';
  successMsg = '';
  userId = '';

  goalForm = { subject_id: '', week_start: this.weekStart(), target_hours: 8 };

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    this.studyflow.bootstrap().subscribe((user) => {
      this.userId = user.id;
      this.load();
    });
  }

  load(): void {
    this.studyflow.subjects(this.userId).subscribe((s) => (this.subjects = s));
    this.studyflow.goals(this.userId).subscribe((g) => (this.goals = g));
  }

  createGoal(): void {
    if (!this.goalForm.subject_id) return;
    this.saving = true; this.clearMsgs();
    this.studyflow.createGoal(this.userId, this.goalForm).subscribe({
      next: () => {
        this.successMsg = 'Objectif créé.';
        this.saving = false;
        this.goalForm.subject_id = '';
        this.load();
      },
      error: () => { this.errorMsg = 'Un objectif existe peut-être déjà pour cette semaine et cette matière.'; this.saving = false; },
    });
  }

  goalPct(goal: SubjectGoal): number {
    return Math.min(100, Math.round((Number(goal.achieved_hours) / Number(goal.target_hours)) * 100));
  }

  private weekStart(): string {
    const d = new Date(); const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff); d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  private clearMsgs(): void { this.errorMsg = ''; this.successMsg = ''; }
}
