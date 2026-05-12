import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, timeout } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { StudyUser, UpdateUserPayload } from '../models/user.model';
import {
  AnalyticsDashboard,
  Availability,
  GroupMember,
  GroupMessage,
  NotificationItem,
  StudyGroup,
  StudySession,
  Subject,
  SubjectGoal,
  SubjectPoint,
  WeeklyPoint,
} from '../models/studyflow.model';

@Injectable({ providedIn: 'root' })
export class StudyflowService {
  private readonly apiUrl = '/backend';
  private readonly currentUserKey = 'studyflow.currentUserId';

  constructor(private http: HttpClient) {}

  bootstrap(): Observable<StudyUser> {
    return this.http.get<StudyUser[]>(`${this.apiUrl}/users`).pipe(
      timeout(8000),
      map((users) => {
        const savedId = localStorage.getItem(this.currentUserKey);
        return users.find((user) => user.id === savedId) || users.find((user) => user.status === 'active') || users[0];
      }),
      tap((user) => {
        if (user) {
          localStorage.setItem(this.currentUserKey, user.id);
        }
      }),
    );
  }

  setCurrentUser(userId: string): void {
    localStorage.setItem(this.currentUserKey, userId);
  }

  getAllUsers(): Observable<StudyUser[]> {
    return this.http.get<StudyUser[]>(`${this.apiUrl}/users`).pipe(timeout(8000));
  }

  getUser(userId: string): Observable<StudyUser> {
    return this.http.get<StudyUser>(`${this.apiUrl}/users/${userId}`).pipe(timeout(8000));
  }

  updateUser(userId: string, payload: UpdateUserPayload): Observable<StudyUser> {
    return this.http.patch<StudyUser>(`${this.apiUrl}/users/${userId}`, payload).pipe(timeout(8000));
  }

  subjects(userId: string): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/subjects`, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  createSubject(userId: string, payload: Partial<Subject>): Observable<Subject> {
    return this.http.post<Subject>(`${this.apiUrl}/subjects`, payload, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  deleteSubject(userId: string, id: string): Observable<Subject> {
    return this.http.delete<Subject>(`${this.apiUrl}/subjects/${id}`, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  availabilities(userId: string): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/availabilities`, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  createAvailability(userId: string, payload: Partial<Availability>): Observable<Availability> {
    return this.http.post<Availability>(`${this.apiUrl}/availabilities`, payload, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  deleteAvailability(userId: string, id: string): Observable<Availability> {
    return this.http.delete<Availability>(`${this.apiUrl}/availabilities/${id}`, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  sessions(userId: string): Observable<StudySession[]> {
    return this.http.get<StudySession[]>(`${this.apiUrl}/sessions`, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  createSession(userId: string, payload: Partial<StudySession>): Observable<StudySession> {
    return this.http.post<StudySession>(`${this.apiUrl}/sessions`, payload, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  updateSession(userId: string, id: string, payload: Partial<StudySession>): Observable<StudySession> {
    return this.http.patch<StudySession>(`${this.apiUrl}/sessions/${id}`, payload, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  deleteSession(userId: string, id: string): Observable<StudySession> {
    return this.http.delete<StudySession>(`${this.apiUrl}/sessions/${id}`, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  generateSchedule(userId: string, weekStart: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/weekly-schedules/generate`, { week_start: weekStart }, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  goals(userId: string): Observable<SubjectGoal[]> {
    return this.http.get<SubjectGoal[]>(`${this.apiUrl}/subject-goals`, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  createGoal(userId: string, payload: { subject_id: string; week_start: string; target_hours: number }): Observable<SubjectGoal> {
    return this.http.post<SubjectGoal>(`${this.apiUrl}/subject-goals`, payload, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  groups(userId: string): Observable<StudyGroup[]> {
    return this.http.get<StudyGroup[]>(`${this.apiUrl}/groups`, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  createGroup(userId: string, payload: Partial<StudyGroup>): Observable<StudyGroup> {
    return this.http.post<StudyGroup>(`${this.apiUrl}/groups`, payload, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  joinGroup(userId: string, groupId: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/join`, {}, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  inviteUser(userId: string, groupId: string, email: string): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/groups/${groupId}/invite`, { email }, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  members(groupId: string): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.apiUrl}/groups/${groupId}/members`).pipe(timeout(8000));
  }

  messages(groupId: string): Observable<GroupMessage[]> {
    return this.http.get<GroupMessage[]>(`${this.apiUrl}/groups/${groupId}/messages`).pipe(timeout(8000));
  }

  sendMessage(userId: string, groupId: string, content: string): Observable<GroupMessage> {
    return this.http.post<GroupMessage>(`${this.apiUrl}/groups/${groupId}/messages`, { content }, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  notifications(userId: string): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.apiUrl}/notifications`, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  markNotificationRead(userId: string, id: string): Observable<NotificationItem> {
    return this.http.patch<NotificationItem>(`${this.apiUrl}/notifications/${id}/read`, {}, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  createNotification(userId: string, payload: Partial<NotificationItem>): Observable<NotificationItem> {
    return this.http.post<NotificationItem>(`${this.apiUrl}/notifications`, payload, { params: this.userParams(userId) }).pipe(timeout(8000));
  }

  analytics(userId: string): Observable<{ dashboard: AnalyticsDashboard; weekly: WeeklyPoint[]; subjects: SubjectPoint[] }> {
    return forkJoin({
      dashboard: this.http.get<AnalyticsDashboard>(`${this.apiUrl}/analytics/dashboard`, { params: this.userParams(userId) }),
      weekly: this.http.get<{ days: WeeklyPoint[] }>(`${this.apiUrl}/analytics/weekly`, { params: this.userParams(userId) }).pipe(map((data) => data.days)),
      subjects: this.http.get<SubjectPoint[]>(`${this.apiUrl}/analytics/subjects`, { params: this.userParams(userId) }),
    }).pipe(timeout(8000));
  }

  overview(userId: string) {
    return forkJoin({
      user: this.getUser(userId),
      subjects: this.subjects(userId).pipe(catchError(() => of([]))),
      availabilities: this.availabilities(userId).pipe(catchError(() => of([]))),
      sessions: this.sessions(userId).pipe(catchError(() => of([]))),
      goals: this.goals(userId).pipe(catchError(() => of([]))),
      groups: this.groups(userId).pipe(catchError(() => of([]))),
      notifications: this.notifications(userId).pipe(catchError(() => of([]))),
      analytics: this.analytics(userId).pipe(catchError(() => of(null))),
    });
  }

  firstUserOverview() {
    return this.bootstrap().pipe(switchMap((user) => this.overview(user.id)));
  }

  private userParams(userId: string): HttpParams {
    return new HttpParams().set('userId', userId);
  }
}
