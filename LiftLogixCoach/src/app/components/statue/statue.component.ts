import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-statue',
  templateUrl: './statue.component.html',
  styleUrl: './statue.component.scss'
})
export class StatueComponent {
  @ViewChild('elem', { static: true }) elem!: ElementRef;
  scrollTimeout: any;

  constructor(private renderer: Renderer2) {}

  onScroll(event: Event) {
    const target = event.target as HTMLElement;

    if (target) {
      this.renderer.addClass(document.body, 'show-scrollbar');

      clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        this.renderer.removeClass(document.body, 'show-scrollbar');
      }, 3000);
    }
  }
}
