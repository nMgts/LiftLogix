import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Diet } from "../../interfaces/Diet";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { DietService } from "../../services/diet.service";
import { ClientService } from "../../services/client.service";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-client-diet',
  templateUrl: './client-diet.component.html',
  styleUrl: './client-diet.component.scss'
})
export class ClientDietComponent implements OnInit, OnDestroy {
  @Input() clientId: number | null = null;
  @Output() goBack = new EventEmitter<void>();

  diet: Diet | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  useCalculator = false;
  calculatorForm: FormGroup;
  activityLevels = [
    { label: 'Leżący lub siedzący tryb życia', value: 1.0 },
    { label: 'Praca siedząca, niska aktywność fizyczna', value: 1.2 },
    { label: 'Praca nie fizyczna, trening 2 razy w tygodniu', value: 1.4 },
    { label: 'Lekka praca fizyczna, trening 3-4 razy w tygodniu', value: 1.6 },
    { label: 'Praca fizyczna, trening 5 razy w tygodniu', value: 1.8 },
    { label: 'Ciężka praca fizyczna, codzienny trening', value: 2.0 },
  ];
  goals = [
    { label: 'Redukcja', value: 0.9 },
    { label: 'Utrzymanie', value: 1.0 },
    { label: 'Masa', value: 1.1},
  ]

  private clientIdSubscription!: Subscription;

  constructor(
    private dietService: DietService,
    private clientService: ClientService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.calculatorForm = this.fb.group({
      gender: ['male', Validators.required],
      age: [null, [Validators.required, Validators.min(1), Validators.max(130)]],
      weight: [null, [Validators.required, Validators.min(20), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(120), Validators.max(250)]],
      activityLevel: [1.2, Validators.required],
      proteinPercent: [30, [Validators.required, Validators.min(0), Validators.max(100)]],
      fatPercent: [25, [Validators.required, Validators.min(0), Validators.max(100)]],
      carbPercent: [45, [Validators.required, Validators.min(0), Validators.max(100)]],
      goal: [1.0, Validators.required],
    }, { validators: this.checkSumPercentages });
  }

  ngOnInit() {
    this.clientIdSubscription = this.clientService.selectedClientId$.subscribe(clientId => {
      this.clientId = clientId;
      if (this.clientId !== null) {
        this.diet = null;
        this.errorMessage = null;
        this.loadDiet(this.clientId);
      }
    });
  }

  ngOnDestroy() {
    if (this.clientIdSubscription) {
      this.clientIdSubscription.unsubscribe();
    }
  }

  loadDiet(clientId: number) {
    const token = localStorage.getItem('token') || '';
    this.dietService.getClientDiet(clientId, token).subscribe({
      next: (data) => {
        this.diet = data;
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.diet = null;
          this.errorMessage = 'Dieta nie została jeszcze ustawiona';
        } else {
          this.diet = null;
          console.error('Error during loading diet' + error);
        }
        this.isLoading = false;
      },
    });
  }

  updateDiet() {
    const token = localStorage.getItem('token') || '';
    if (this.diet) {
      this.dietService.updateDiet(this.diet, token).subscribe({
        next: () => {
          this.openSnackBar('Dieta została zaktualizowana');
        },
        error: () => {
          this.openSnackBar('Wystąpił błąd podczas aktualizacji diety');
        },
      });
    }
  }

  createDiet() {
    this.diet = {
      id: 0,
      calories: 0,
      carbs: 0,
      fats: 0,
      proteins: 0,
      notes: '',
      client_id: this.clientId || 0,
    };
  }

  updateCalories() {
    if (this.diet) {
      this.diet.calories =
        (this.diet.carbs || 0) * 4 +
        (this.diet.fats || 0) * 9 +
        (this.diet.proteins || 0) * 4;
    }
  }

  cancel() {
    if (this.clientId) {
      this.loadDiet(this.clientId);
    }
  }

  /** Calculator */

  onToggleCalculator() {
    if (!this.useCalculator) {
      this.calculatorForm.reset({
        gender: 'male',
        activityLevel: 1.2,
        proteinPercent: 30,
        fatPercent: 25,
        carbPercent: 45,
      });
    }
  }

  calculateCalories() {
    if (this.calculatorForm.invalid) {
      this.openSnackBar("Błąd - nieprawidłowo wypełniony formularz");
      return;
    }

    const { gender, age, weight, height, activityLevel, proteinPercent, fatPercent, carbPercent, goal } = this.calculatorForm.value;
    const bmr =
      gender === 'male'
        ? 66.5 + 13.7 * weight + 5 * height - 6.8 * age
        : 655 + 9.6 * weight + 1.85 * height - 4.7 * age;
    const tdee = bmr * activityLevel * goal;

    const proteinCalories = (proteinPercent / 100) * tdee;
    const fatCalories = (fatPercent / 100) * tdee;
    const carbCalories = (carbPercent / 100) * tdee;

    if (this.diet) {
      this.diet.proteins = Math.round(proteinCalories / 4);
      this.diet.carbs = Math.round(carbCalories / 4);
      this.diet.fats = Math.round(fatCalories / 9);
      this.diet.calories = 4 * this.diet.proteins + 4 * this.diet.carbs + 9 * this.diet.fats;
    }
  }

  checkSumPercentages(control: AbstractControl): { [key: string]: boolean } | null {
    const protein = control.get('proteinPercent')?.value;
    const fat = control.get('fatPercent')?.value;
    const carbs = control.get('carbPercent')?.value;

    if (protein + fat + carbs !== 100) {
      return { sumNotEqual: true };
    }

    return null;
  }

  /** Basic methods */

  private openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }

  onGoBack() {
    this.goBack.emit();
  }
}
