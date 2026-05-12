import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GroupMessage, StudyGroup } from '../../models/studyflow.model';
import { StudyflowService } from '../../services/studyflow';

@Component({
  selector: 'app-messages-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-page.html',
  styleUrl: './messages-page.css',
})
export class MessagesPageComponent implements OnInit {
  groups: StudyGroup[] = [];
  messages: GroupMessage[] = [];
  selectedGroup: StudyGroup | null = null;
  messageText = '';
  inviteEmail = '';
  userId = '';
  errorMsg = '';
  successMsg = '';

  @ViewChild('chatScroll') chatScroll?: ElementRef;

  constructor(private studyflow: StudyflowService) {}

  ngOnInit(): void {
    this.studyflow.bootstrap().subscribe((user) => {
      this.userId = user.id;
      this.studyflow.groups(user.id).subscribe((g) => {
        this.groups = g;
        if (g.length > 0) this.selectGroup(g[0]);
      });
    });
  }

  selectGroup(group: StudyGroup): void {
    this.selectedGroup = group;
    this.loadMessages();
  }

  loadMessages(): void {
    if (!this.selectedGroup) return;
    this.studyflow.messages(this.selectedGroup.id).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        setTimeout(() => this.scrollBottom(), 50);
      },
    });
  }

  sendMessage(): void {
    if (!this.selectedGroup || !this.messageText.trim()) return;
    this.studyflow.sendMessage(this.userId, this.selectedGroup.id, this.messageText).subscribe({
      next: () => { this.messageText = ''; this.loadMessages(); },
      error: () => { this.errorMsg = 'Vous devez être membre du groupe pour envoyer des messages.'; },
    });
  }

  inviteUser(): void {
    if (!this.selectedGroup || !this.inviteEmail) return;
    this.studyflow.inviteUser(this.userId, this.selectedGroup.id, this.inviteEmail).subscribe({
      next: () => { this.successMsg = 'Invitation envoyée.'; this.inviteEmail = ''; },
      error: () => { this.errorMsg = 'Impossible d\'inviter cet utilisateur.'; },
    });
  }

  timeAgo(val: string): string {
    const diff = Date.now() - new Date(val).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}j`;
  }

  private scrollBottom(): void {
    if (this.chatScroll) {
      const el = this.chatScroll.nativeElement as HTMLElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
