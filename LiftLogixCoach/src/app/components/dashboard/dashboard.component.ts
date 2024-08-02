import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { ClientService } from "../../services/client.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  expandedBox: string | null = null;

  constructor(private cdr: ChangeDetectorRef, private clientService: ClientService) {}

  ngOnInit(): void {}

  expandBox(box: string) {
    this.expandedBox = this.expandedBox === box ? null : box;
  }
}
