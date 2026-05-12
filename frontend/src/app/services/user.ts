import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import {
  CreateUserPayload,
  StudyUser,
  UpdateUserPayload,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl =
    '/backend/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<StudyUser[]> {
    return this.http.get<StudyUser[]>(
      this.apiUrl,
    ).pipe(timeout(8000));
  }

  getUser(id: string): Observable<StudyUser> {
    return this.http.get<StudyUser>(
      `${this.apiUrl}/${id}`,
    ).pipe(timeout(8000));
  }

  createUser(
    payload: CreateUserPayload,
  ): Observable<StudyUser> {
    return this.http.post<StudyUser>(
      this.apiUrl,
      payload,
    ).pipe(timeout(8000));
  }

  updateUser(
    id: string,
    payload: UpdateUserPayload,
  ): Observable<StudyUser> {
    return this.http.patch<StudyUser>(
      `${this.apiUrl}/${id}`,
      payload,
    ).pipe(timeout(8000));
  }

  deleteUser(id: string): Observable<StudyUser> {
    return this.http.delete<StudyUser>(
      `${this.apiUrl}/${id}`,
    ).pipe(timeout(8000));
  }
}
