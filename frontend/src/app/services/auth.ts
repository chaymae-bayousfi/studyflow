import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { timeout, map } from 'rxjs/operators';

import { StudyUser } from '../models/user.model';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: StudyUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/backend';
  private readonly tokenKey = 'studyflow.token';
  private readonly userKey = 'studyflow.currentUserId';
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient) {}

  get isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  login(email: string, password: string): Observable<StudyUser> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      timeout(8000),
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.access_token);
        localStorage.setItem(this.userKey, res.user.id);
        this.loggedIn$.next(true);
      }),
      map((res) => res.user),
    );
  }

  logout(): Observable<unknown> {
    const token = localStorage.getItem(this.tokenKey);
    const obs: Observable<unknown> = token
      ? this.http.post(`${this.apiUrl}/auth/logout`, { refresh_token: token }).pipe(timeout(5000))
      : of(undefined);
    return obs.pipe(
      tap(() => {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.loggedIn$.next(false);
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem(this.userKey);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
