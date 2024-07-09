import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  isGrid5Expanded = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  toggleGrid5Expanded(event: Event): void {
    event.stopPropagation();
    this.isGrid5Expanded = !this.isGrid5Expanded;

    const gridsToToggle = document.querySelectorAll('.wrapper > div:not(.grid5)');
    gridsToToggle.forEach(grid => grid.classList.toggle('fade-out'));
  }
}
