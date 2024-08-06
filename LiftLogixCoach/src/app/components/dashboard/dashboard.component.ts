import { Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  expandedBox: string | null = null;

  constructor() {}

  ngOnInit(): void {}

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
}
