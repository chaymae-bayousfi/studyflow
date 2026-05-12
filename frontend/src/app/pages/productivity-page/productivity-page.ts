import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { AnalyticsDashboard, SubjectPoint, WeeklyPoint } from '../../models/studyflow.model';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-productivity-page',
  imports: [CommonModule],
  templateUrl: './productivity-page.html',
  styleUrl: './productivity-page.css',
})
export class ProductivityPageComponent implements OnInit {
  analytics: AnalyticsDashboard = { totalSessions: 0, completedSessions: 0, totalStudyHours: 0, averageProductivity: 0 };
  weekly: WeeklyPoint[] = [];
  subjectStats: SubjectPoint[] = [];

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    this.studyflow.bootstrap().subscribe((user) => {
      this.studyflow.analytics(user.id).subscribe({
        next: (data) => {
          this.analytics = data.dashboard;
          this.weekly = data.weekly;
          this.subjectStats = data.subjects;
        },
      });
    });
  }

  get completionRate(): number {
    if (!this.analytics.totalSessions) return 0;
    return Math.round((this.analytics.completedSessions / this.analytics.totalSessions) * 100);
  }

  barH(hours: number): number {
    const max = Math.max(1, ...this.weekly.map((p) => p.hours));
    return Math.round((hours / max) * 100);
  }

  subjectBarW(hours: number): number {
    const max = Math.max(1, ...this.subjectStats.map((s) => s.hours));
    return Math.round((hours / max) * 100);
  }
}
