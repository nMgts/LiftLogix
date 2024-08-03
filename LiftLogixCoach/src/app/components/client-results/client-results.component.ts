import {Component, Input, OnInit} from '@angular/core';
import {ClientsComponent} from "../clients/clients.component";
import {ResultService} from "../../services/result.service";
import {Result} from "../../interfaces/Result";

@Component({
  selector: 'app-client-results',
  templateUrl: './client-results.component.html',
  styleUrl: './client-results.component.scss'
})
export class ClientResultsComponent implements OnInit{
  @Input() clientId: number | null = null;
  currentResult: Result | null = null;

  constructor(
    private clientsComponent: ClientsComponent,
    private resultService: ResultService
  ) {}

  ngOnInit(): void {
    if (this.clientId !== null) {
      this.loadCurrentResult(this.clientId);
    }
  }

  loadCurrentResult(clientId: number) {
    const token = localStorage.getItem('token') || '';
    this.resultService.getCurrentResult(clientId, token).subscribe(
      (result) => this.currentResult = this.formatResult(result),
      (error) => console.error('Error loading current result', error)
    );
  }

  formatResult(result: Result): Result {
    return {
      ...result,
      benchpress: result.benchpress !== null ? result.benchpress : '-',
      deadlift: result.deadlift !== null ? result.deadlift : '-',
      squat: result.squat !== null ? result.squat : '-'
    };
  }

  goBack(event: Event) {
    event.stopPropagation();
    this.clientsComponent.clearSelectedComponent();
  }
}
