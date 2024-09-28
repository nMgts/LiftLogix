import { Component, Renderer2 } from '@angular/core';
import { User } from "../../interfaces/User";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent  {
  expandedBox: string | null = null;
  private scrollTimeout: any;
  showChat = true;
  currentUserId = localStorage.getItem('email') || '';

  chatUsers: User[] = [];

  constructor(private renderer: Renderer2) {}

  expandBox(box: string) {
    if (this.expandedBox !== box) {
      this.expandedBox = box;
    }
  }

  closeBox(box: string) {
    if (this.expandedBox === box) {
      this.expandedBox = null;
    }
  }

  openChat(user: User) {
    this.chatUsers.push(user);
  }

  closeChat(email: string) {
    this.chatUsers = this.chatUsers.filter(chatUser => chatUser.email !== email);
  }

  onScroll(): void {
    this.renderer.addClass(document.body, 'show-scrollbar');

    this.scrollTimeout = setTimeout(() => {
      this.renderer.removeClass(document.body, 'show-scrollbar');
    }, 3000);
  }
}
