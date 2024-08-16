import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ClientsComponent } from "../clients/clients.component";
import { ResultService } from "../../services/result.service";
import { Result } from "../../interfaces/Result";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChartDataset, ChartOptions } from 'chart.js';
import { ClientService } from "../../services/client.service";
import { Subscription } from "rxjs";
import { EditResultDialogComponent } from "../edit-result-dialog/edit-result-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: 'app-client-results',
  templateUrl: './client-results.component.html',
  styleUrl: './client-results.component.scss'
})
export class ClientResultsComponent implements OnInit, OnDestroy{
  @Input() clientId: number | null = null;
  @Output() closeRightComponent = new EventEmitter<void>();
  currentResult: Result | null = null;
  results: Result[] = [];
  filteredResults: Result[] = [];
  showLastYear: boolean = true;

  benchpress: number | null = null;
  deadlift: number | null = null;
  squat: number | null = null;
  date: string = '';
  currentDate: string = '';
  total: number = 0;

  public lineChartData: ChartDataset[] = [
    { data: [], label: 'Wyciskanie leżąc' },
    { data: [], label: 'Martwy ciąg' },
    { data: [], label: 'przysiad' }
  ];
  public lineChartLabels: string[] = [];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public lineChartLegend = true;

  showBenchpress: boolean = true;
  showDeadlift: boolean = true;
  showSquat: boolean = true;

  showAllResults: boolean = false;
  displayedColumns: string[] = ['benchpress', 'squat', 'deadlift', 'date', 'actions'];
  tableResults: Result[] = [];
  sortOrder: 'asc' | 'desc' = 'asc';

  private clientIdSubscription!: Subscription;

  constructor(
    private clientsComponent: ClientsComponent,
    private resultService: ResultService,
    private snackBar: MatSnackBar,
    private clientService: ClientService,
    private dialog: MatDialog
  ) {
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
    this.date = this.currentDate;
  }

  ngOnInit(): void {
    this.clientIdSubscription = this.clientService.selectedClientId$.subscribe(clientId => {
      this.clientId = clientId;
      if (this.clientId !== null) {
        this.loadCurrentResult(this.clientId);
        this.loadResults(this.clientId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.clientIdSubscription) {
      this.clientIdSubscription.unsubscribe();
    }
  }

  loadResults(clientId: number): void {
    const token = localStorage.getItem('token') || '';
    this.resultService.getAllResults(clientId, token).subscribe({
      next: (results) => {
        this.results = results;
        this.tableResults = results;
        this.filterResults();
      },
      error: (error) => {
        console.error('Error during loading results' + error);
      }
    })
  }

  loadCurrentResult(clientId: number): void {
    const token = localStorage.getItem('token') || '';
    this.resultService.getCurrentResult(clientId, token).subscribe(
      (result) => {
        this.currentResult = this.formatResult(result);
        if (typeof this.currentResult.benchpress === 'number') this.total = this.currentResult.benchpress;
        if (typeof this.currentResult.deadlift === 'number') this.total += this.currentResult.deadlift;
        if (typeof this.currentResult.squat === 'number') this.total += this.currentResult.squat;
      },
      (error) => console.error('Error loading current result', error)
    );
  }

  editResult(result: Result): void {
    const dialogRef = this.dialog.open(EditResultDialogComponent, {
      data: {
        benchpress: result.benchpress,
        squat: result.squat,
        deadlift: result.deadlift,
        date: result.date
      }
    });

    dialogRef.afterClosed().subscribe(updatedResult => {
      if (updatedResult) {
        this.updateResult({
          ...result,
          ...updatedResult
        });

        if (this.clientId !== null) {
          this.loadCurrentResult(this.clientId);
          this.loadResults(this.clientId);
        }
      }
    });
  }

  updateResult(result: Result) {
    const token = localStorage.getItem('token') || '';

    const benchpressValue: number | null =
      result.benchpress !== undefined && result.benchpress !== null ? Number(result.benchpress) : null;
    const deadliftValue: number | null =
      result.deadlift !== undefined && result.deadlift !== null ? Number(result.deadlift) : null;
    const squatValue: number | null =
      result.squat !== undefined && result.squat !== null ? Number(result.squat) : null;

    if (!this.validateResult(benchpressValue, deadliftValue, squatValue)) {
      this.openSnackBar('Wprowadź dodatnią liczbę lub zostaw pole puste.');
      return;
    }

    this.resultService.updateResult(result, token).subscribe({
      next: () => {
        this.openSnackBar('Wynik został zaktualizowany!');
        if (this.clientId !== null) {
          this.loadCurrentResult(this.clientId);
          this.loadResults(this.clientId);
          this.tableResults = this.results;
        }
      },
      error: (error) => {
        if (error.status === 400) {
          this.openSnackBar('Wprowadź przynajmiej jeden wynik');
        } else if (error.status === 409) {
          this.openSnackBar("W tym dniu wynik jest już zapisany");
        } else {
          this.openSnackBar('Nie udało sie wprowadzić wyniku');
        }
      }
    });
  }

  deleteResult(result: Result) {
    const token = localStorage.getItem('token') || '';

    if (result.id === undefined) {
      this.openSnackBar('Nie można usunąć wyniku bez id.');
      return;
    }

    this.resultService.deleteResult(result.id, token).subscribe({
      next: () => {
        this.openSnackBar('Usunięto wynik');
        if (this.clientId !== null) {
          this.loadCurrentResult(this.clientId);
          this.loadResults(this.clientId);
        }

        if (this.clientId !== null) {
          this.loadCurrentResult(this.clientId);
          this.loadResults(this.clientId);
        }
      },
      error: (error) => {
        console.error('Error deleting result', error);
        this.openSnackBar('Nie udało się usunąć wyniku.');
      }
    });
  }

  filterResults(): void {
    this.results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (this.showLastYear) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      this.filteredResults = this.results.filter(result => new Date(result.date) >= oneYearAgo);
    } else {
      this.filteredResults = this.results;
    }

    this.updateChartData();
  }

  updateTableResults() {
    this.tableResults.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    this.tableResults = [...this.tableResults];
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.updateTableResults();
  }

  updateChartData() {
    const dateMap: { [key: string]: { benchpress: number | null, deadlift: number | null, squat: number | null } } = {};

    this.filteredResults.forEach(result => {
      const date = new Date(result.date).toLocaleDateString('pl-PL');

      if (!dateMap[date]) {
        dateMap[date] = {
          benchpress: null,
          deadlift: null,
          squat: null
        };
      }

      if (this.showBenchpress) {
        dateMap[date].benchpress = Number(result.benchpress) || null;
      }
      if (this.showDeadlift) {
        dateMap[date].deadlift = Number(result.deadlift) || null;
      }
      if (this.showSquat) {
        dateMap[date].squat = Number(result.squat) || null;
      }
    });

    const filteredDates: string[] = [];
    const benchpressData: (number | null)[] = [];
    const deadliftData: (number | null)[] = [];
    const squatData: (number | null)[] = [];

    Object.keys(dateMap).forEach(date => {
      const data = dateMap[date];

      if (data.benchpress !== null || data.deadlift !== null || data.squat !== null) {
        filteredDates.push(date);
        benchpressData.push(data.benchpress);
        deadliftData.push(data.deadlift);
        squatData.push(data.squat);
      }
    });

    this.lineChartLabels = filteredDates;

    this.lineChartData[0] = {
      data: this.getFilteredData(benchpressData, filteredDates),
      label: 'Wyciskanie leżąc',
      hidden: !this.showBenchpress
    };

    this.lineChartData[1] = {
      data: this.getFilteredData(deadliftData, filteredDates),
      label: 'Martwy ciąg',
      hidden: !this.showDeadlift
    };

    this.lineChartData[2] = {
      data: this.getFilteredData(squatData, filteredDates),
      label: 'Przysiad',
      hidden: !this.showSquat
    };
  }

  private getFilteredData(dataArray: (number | null)[], dates: string[]): (number | null)[] {
    const dataMap: { [key: string]: number | null } = {};
    dates.forEach((date, index) => {
      dataMap[date] = dataArray[index] !== undefined ? dataArray[index] : null;
    });

    return dates.map(date => dataMap[date] || null);
  }

  toggleFilter(): void {
    this.showLastYear = !this.showLastYear;
    this.filterResults();
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

    if (!this.validateResult(this.benchpress, this.deadlift, this.squat)) {
      this.openSnackBar('Wprowadź dodatnią liczbę lub zostaw pole puste.');
      return;
    }

    const result: Result = {
      id: 0,
      date: this.date
    };

    if (typeof this.benchpress === 'number') {
      result.benchpress = this.benchpress;
    }

    if (typeof this.squat === 'number') {
      result.squat = this.squat;
    }

    if (typeof this.deadlift === 'number') {
      result.deadlift = this.deadlift;
    }

    if (!this.validateDate(this.date)) {
      this.openSnackBar('Data nie może być późniejsza niż dzisiejsza.');
      return;
    }

    const token = localStorage.getItem('token') || '';
    this.resultService.addResult(this.clientId, token, result)
      .subscribe({
        next: () => {
          this.openSnackBar('Dodano nowy wynik');
          this.benchpress = null;
          this.deadlift = null;
          this.squat = null;
          this.date = this.currentDate;
          if (this.clientId !== null) {
            this.loadCurrentResult(this.clientId);
            this.loadResults(this.clientId);
          }
        },
        error: (error) => {
          if (error.status === 400) {
            this.openSnackBar('Wprowadź przynajmiej jeden wynik');
          } else if (error.status === 409) {
            this.openSnackBar('Wynik dla podanego ćwiczenia istnieje w danym dniu');
          } else {
            this.openSnackBar('Nie udało sie wprowadzić wyniku');
          }
        }
      });
  }

  validateResult(benchpress: number | null, deadlift: number | null, squat: number | null): boolean {
    return !((benchpress != null && benchpress <= 0) ||
      (deadlift != null && deadlift <= 0) ||
      (squat != null && squat <= 0));
  }

  validateDate(date: string): boolean {
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inputDate <= today;
  }

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  goBack(): void {
    this.clientsComponent.clearSelectedComponent();
  }
}
