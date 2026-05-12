import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPageComponent {
  email = '';
  password = '';
  showPw = false;
  loading = false;
  errorMsg = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  login(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.errorMsg = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Email ou mot de passe incorrect.';
      },
    });
  }
}
