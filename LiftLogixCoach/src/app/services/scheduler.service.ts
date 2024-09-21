import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private loadSchedulerSubject = new Subject<void>();

  loadScheduler$ = this.loadSchedulerSubject.asObservable();

  constructor() {}

  triggerLoadScheduler() {
    this.loadSchedulerSubject.next();
  }
}
