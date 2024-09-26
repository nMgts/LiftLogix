import { Component, Renderer2 } from '@angular/core';

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
  currentRecipientId = localStorage.getItem('email') === 'norbert.klessen@gmail.com' ? 'coach@example.com' : 'norbert.klessen@gmail.com';

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

  openChat() {
    this.showChat = true;
  }

  closeChat() {
    this.showChat = false;
  }

  onScroll(): void {
    this.renderer.addClass(document.body, 'show-scrollbar');

    this.scrollTimeout = setTimeout(() => {
      this.renderer.removeClass(document.body, 'show-scrollbar');
    }, 3000);
  }
}
