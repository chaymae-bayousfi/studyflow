import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StudyGroup, Subject } from '../../models/studyflow.model';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-groups-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './groups-page.html',
  styleUrl: './groups-page.css',
})
export class GroupsPageComponent implements OnInit {
  groups: StudyGroup[] = [];
  subjects: Subject[] = [];
  saving = false;
  errorMsg = '';
  successMsg = '';
  userId = '';
  joinCode = '';

  groupForm = { name: '', description: '', subject_id: '', is_public: true };

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    this.studyflow.bootstrap().subscribe((user) => {
      this.userId = user.id;
      this.load();
    });
  }

  load(): void {
    this.studyflow.groups(this.userId).subscribe((g) => (this.groups = g));
    this.studyflow.subjects(this.userId).subscribe((s) => (this.subjects = s));
  }

  createGroup(): void {
    if (!this.groupForm.name) return;
    this.saving = true; this.clearMsgs();
    this.studyflow.createGroup(this.userId, this.groupForm).subscribe({
      next: () => { this.successMsg = 'Groupe créé.'; this.saving = false; this.groupForm.name = ''; this.load(); },
      error: () => { this.errorMsg = 'Impossible de créer le groupe.'; this.saving = false; },
    });
  }

  joinGroup(groupId: string): void {
    this.saving = true; this.clearMsgs();
    this.studyflow.joinGroup(this.userId, groupId).subscribe({
      next: () => { this.successMsg = 'Groupe rejoint.'; this.saving = false; this.load(); },
      error: () => { this.errorMsg = 'Impossible de rejoindre le groupe.'; this.saving = false; },
    });
  }

  joinByCode(): void {
    if (!this.joinCode) return;
    this.saving = true; this.clearMsgs();
    this.studyflow.joinByCode(this.userId, this.joinCode).subscribe({
      next: () => { this.successMsg = 'Groupe rejoint par code.'; this.saving = false; this.joinCode = ''; this.load(); },
      error: () => { this.errorMsg = 'Code invalide ou groupe introuvable.'; this.saving = false; },
    });
  }

  private clearMsgs(): void { this.errorMsg = ''; this.successMsg = ''; }
}
