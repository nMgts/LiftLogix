import { Component, HostListener, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'LiftLogixCoach';

  private isScrolling: boolean = false;
  private scrollTimeout: any;

  constructor(private renderer: Renderer2) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isScrolling) {
      this.isScrolling = true;
      console.log('A');
      this.renderer.addClass(document.body, 'show-scrollbar');
    }

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.renderer.removeClass(document.body, 'show-scrollbar');
    }, 100);
  }
}
