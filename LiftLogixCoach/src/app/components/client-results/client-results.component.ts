import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { ClientsComponent } from "../clients/clients.component";
import { ResultService } from "../../services/result.service";
import { Result } from "../../interfaces/Result";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChartDataset, ChartOptions } from 'chart.js';
import { ClientService } from "../../services/client.service";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-client-results',
  templateUrl: './client-results.component.html',
  styleUrl: './client-results.component.scss'
})
export class ClientResultsComponent implements OnInit, OnDestroy {
  @Input() clientId: number | null = null;
  @Output() closeRightComponent = new EventEmitter<void>();
  currentResult: Result | null = null;
  results: Result[] = [];
  filteredResults: Result[] = [];
  showLastYear: boolean = true;

  benchpress: number | null = null;
  deadlift: number | null = null;
  squat: number | null = null;
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

  private clientIdSubscription!: Subscription;

  constructor(
    private clientsComponent: ClientsComponent,
    private resultService: ResultService,
    private snackBar: MatSnackBar,
    private clientService: ClientService
  ) {}

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
        this.filterResults();
        console.log(results);
      },
      error: (error) => {
        console.error("Nie udało się pobrać wykresu" + error);
      }
    })
  }

  loadCurrentResult(clientId: number): void {
    const token = localStorage.getItem('token') || '';
    this.resultService.getCurrentResult(clientId, token).subscribe(
      (result) => {
        this.currentResult = this.formatResult(result);
        if (typeof this.currentResult.benchpress === "number") this.total = this.currentResult.benchpress;
        if (typeof this.currentResult.deadlift === "number") this.total += this.currentResult.deadlift;
        if (typeof this.currentResult.squat === "number") this.total += this.currentResult.squat;
      },
      (error) => console.error('Error loading current result', error)
    );
  }

  filterResults(): void {
    if (this.showLastYear) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      this.filteredResults = this.results.filter(result => new Date(result.date) >= oneYearAgo);
    } else {
      this.filteredResults = this.results;
    }

    this.filteredResults.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.updateChartData();
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

    const token = localStorage.getItem('token') || '';
    this.resultService.addResult(this.clientId, token, this.benchpress, this.deadlift, this.squat)
      .subscribe({
        next: () => {
          this.openSnackBar('Result added successfully!');
          this.benchpress = null;
          this.deadlift = null;
          this.squat = null;
          if (this.clientId !== null) {
            this.loadCurrentResult(this.clientId);
            this.loadResults(this.clientId);
          }
        },
        error: (error) => {
          if (error.status === 400) {
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

  goBack(): void {
    this.clientsComponent.clearSelectedComponent();
  }
}
