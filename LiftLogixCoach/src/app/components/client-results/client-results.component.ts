import {Component, Input, OnInit} from '@angular/core';
import {ClientsComponent} from "../clients/clients.component";
import {ResultService} from "../../services/result.service";
import {Result} from "../../interfaces/Result";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-client-results',
  templateUrl: './client-results.component.html',
  styleUrl: './client-results.component.scss'
})
export class ClientResultsComponent implements OnInit{
  @Input() clientId: number | null = null;
  currentResult: Result | null = null;

  benchpress: number | null = null;
  deadlift: number | null = null;
  squat: number | null = null;

  constructor(
    private clientsComponent: ClientsComponent,
    private resultService: ResultService,
    private snackBar: MatSnackBar
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

  addResult() {
    if (this.clientId === null) {
      this.openSnackBar('Nieprawidłowe id klietna');
      return
    }

    const token = localStorage.getItem('token') || '';
    this.resultService.addResult(this.clientId, token, this.benchpress, this.deadlift, this.squat)
      .subscribe({
        next: (result) => {
          this.openSnackBar('Result added successfully!');
          this.benchpress = null;
          this.deadlift = null;
          this.squat = null;
          if (this.clientId !== null) {
            this.loadCurrentResult(this.clientId);
          }
        },
        error: (error) => {
          if (error.status = 400) {
            this.openSnackBar('Wprowadź przynajmiej jeden wynik');
          } else {
            this.openSnackBar('Nie udało sie wprowadzić wyniku');
          }
        }
      });
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  goBack(event: Event): void {
    event.stopPropagation();
    this.clientsComponent.clearSelectedComponent();
  }
}
