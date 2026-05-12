import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';

import { StudyUser } from '../../models/user.model';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-user-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetailsComponent implements OnInit {
  user: StudyUser | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage =
        'Utilisateur introuvable.';
      return;
    }

    this.isLoading = true;
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage =
          'Impossible de charger ce user.';
        this.isLoading = false;
      },
    });
  }

  initials(user: StudyUser): string {
    return `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase();
  }
}
